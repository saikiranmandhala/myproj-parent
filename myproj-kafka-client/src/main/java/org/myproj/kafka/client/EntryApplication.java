package org.myproj.kafka.client;

import org.myproj.infrastructure.QueryExecutor;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

import java.util.Properties;

public class EntryApplication {
	public static void main(String[] args) throws JsonMappingException, JsonProcessingException {
		// Kafka connection config
		Properties kafkaProps = new Properties();
		kafkaProps.put("bootstrap.servers", "localhost:9092");
		kafkaProps.put("group.id", "my-query-group");
		kafkaProps.put("enable.auto.commit", "false");
		kafkaProps.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
		kafkaProps.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");

		// Oracle config
		String jdbcUrl = "jdbc:oracle:thin:@localhost:1521:xe";
		String user = "your_user";
		String pass = "your_password";
		
		// todo: take configs from env file.
		QueryExecutor oracleExecutor = new QueryExecutor();

		// Start Kafka consumer
		KafkaMessageConsumer consumer = new KafkaMessageConsumer("my-topic", oracleExecutor, kafkaProps);
		consumer.TestRun();
	}
}
