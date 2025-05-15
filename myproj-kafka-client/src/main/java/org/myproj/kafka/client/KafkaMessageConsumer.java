package org.myproj.kafka.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.errors.WakeupException;

import org.myproj.domain.QueryRequest;
import org.myproj.domain.QueryRequestValidator;
import org.myproj.infrastructure.QueryExecutor;
import org.myproj.infrastructure.QueryBuilder;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public class KafkaMessageConsumer {
	private final KafkaConsumer<String, String> consumer;
	private final ObjectMapper objectMapper = new ObjectMapper();
	private final QueryBuilder queryBuilder = new QueryBuilder();
	private final QueryExecutor queryExecutor;

	public KafkaMessageConsumer(String topic, QueryExecutor queryExecutor, Properties kafkaProps) {
		this.consumer = new KafkaConsumer<>(kafkaProps);
		this.consumer.subscribe(Collections.singletonList(topic));
		this.queryExecutor = queryExecutor;
	}

	public void TestRun() throws JsonMappingException, JsonProcessingException {
		String jsonInput = """
						        {
				  "tableName": "EMPLOYEES",
				  "selectColumns": ["ID", "NAME", "DEPARTMENT"],
				  "whereFilters": {
				    "DEPARTMENT": "IT"
				  },
				  "orderBy": ["NAME"]
				}
						        """;
		// Deserialize
		QueryRequest request = objectMapper.readValue(jsonInput, QueryRequest.class);

		// Validate
		QueryRequestValidator.validate(request);

		// Build query
		String sql = queryBuilder.buildQuery(request);

		// Execute
		List<Map<String, Object>> result = queryExecutor.executeQuery(sql);
		System.out.println("Query Result: " + result);
	}

	public void run() {
		try {
			while (true) {
				ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(1));

				for (ConsumerRecord<String, String> record : records) {
					try {
						// Deserialize
						QueryRequest request = objectMapper.readValue(record.value(), QueryRequest.class);

						// Validate
						QueryRequestValidator.validate(request);

						// Build query
						String sql = queryBuilder.buildQuery(request);

						// Execute
						List<Map<String, Object>> result = queryExecutor.executeQuery(sql);
						System.out.println("Query Result: " + result);

						// Commit only if successful
						consumer.commitSync();
					} catch (Exception ex) {
						System.err.println("Error processing record: " + ex.getMessage());
						ex.printStackTrace();
						// Don't commit offset, so Kafka can retry
					}
				}
			}
		} catch (WakeupException e) {
			System.out.println("Shutting down consumer...");
		} finally {
			consumer.close();
		}
	}
}
