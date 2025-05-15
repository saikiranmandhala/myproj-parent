package org.myproj.domain;

public class QueryRequestValidator {

    public static void validate(QueryRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("QueryRequest must not be null");
        }

        if (request.getTableName() == null || request.getTableName().isBlank()) {
            throw new IllegalArgumentException("Table name is required");
        }

        if (request.getSelectColumns() == null || request.getSelectColumns().isEmpty()) {
            throw new IllegalArgumentException("At least one select column is required");
        }
    }
}
