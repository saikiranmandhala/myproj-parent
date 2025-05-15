package org.myproj.domain;

import java.util.List;
import java.util.Map;
import java.util.Objects;

public class QueryRequest {

    private String tableName;
    private List<String> selectColumns;
    private Map<String, String> whereFilters;
    private List<String> orderBy;

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public List<String> getSelectColumns() {
        return selectColumns;
    }

    public void setSelectColumns(List<String> selectColumns) {
        this.selectColumns = selectColumns;
    }

    public Map<String, String> getWhereFilters() {
        return whereFilters;
    }

    public void setWhereFilters(Map<String, String> whereFilters) {
        this.whereFilters = whereFilters;
    }

    public List<String> getOrderByColumns() {
        return orderBy;
    }

    public void setOrderBy(List<String> orderBy) {
        this.orderBy = orderBy;
    }

    public boolean isValid() {
        return tableName != null && !tableName.isBlank()
                && selectColumns != null && !selectColumns.isEmpty();
    }

    @Override
    public String toString() {
        return "QueryRequest{" +
                "tableName='" + tableName + '\'' +
                ", selectColumns=" + selectColumns +
                ", whereFilters=" + whereFilters +
                ", orderBy=" + orderBy +
                '}';
    }
}
