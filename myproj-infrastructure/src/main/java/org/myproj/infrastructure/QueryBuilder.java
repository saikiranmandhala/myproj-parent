package org.myproj.infrastructure;

import org.myproj.domain.QueryRequest;
import java.util.Map;
import java.util.StringJoiner;

public class QueryBuilder {

    public String buildQuery(QueryRequest request) {
    	StringJoiner sql = new StringJoiner(" ");
        sql.add("SELECT");
        sql.add(String.join(", ", request.getSelectColumns()));
        sql.add("FROM");
        sql.add(request.getTableName());

        Map<String, String> filters = request.getWhereFilters();
        if (filters != null && !filters.isEmpty()) {
            sql.add("WHERE");
            sql.add(filters.entrySet().stream()
                    .map(entry -> entry.getKey() + " = '" + entry.getValue() + "'")
                    .reduce((a, b) -> a + " AND " + b).orElse(""));
        }

        if (request.getOrderByColumns() != null && !request.getOrderByColumns().isEmpty()) {
            sql.add("ORDER BY");
            sql.add(String.join(", ", request.getOrderByColumns()));
        }

        return sql.toString();
    }
}
