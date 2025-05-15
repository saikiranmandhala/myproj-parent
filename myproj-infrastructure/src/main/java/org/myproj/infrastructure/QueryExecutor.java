package org.myproj.infrastructure;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class QueryExecutor {
	private static final String DB_URL = "jdbc:h2:mem:testdb;MODE=Oracle;DB_CLOSE_DELAY=-1";
	private static final String USER = "sa";
	private static final String PASSWORD = "";

	public List<Map<String, Object>> executeQuery(String query) {
		List<Map<String, Object>> resultList = new ArrayList<>();		

		try (Connection connection = DriverManager.getConnection(DB_URL, USER, PASSWORD)) {
			this.initializeSchema();
			Statement stmt = connection.createStatement();
			ResultSet rs = stmt.executeQuery(query);

			ResultSetMetaData metaData = rs.getMetaData();
			int columnCount = metaData.getColumnCount();

			while (rs.next()) {
				Map<String, Object> row = new HashMap<>();

				for (int i = 1; i <= columnCount; i++) {
					row.put(metaData.getColumnLabel(i), rs.getObject(i));
				}

				resultList.add(row);
			}

		} catch (SQLTimeoutException timeoutEx) {
			System.err.println("Query timed out: " + timeoutEx.getMessage());
			timeoutEx.printStackTrace();
		} catch (SQLRecoverableException connEx) {
			System.err.println("Connection error: " + connEx.getMessage());
			connEx.printStackTrace();
		} catch (SQLException sqlEx) {
			System.err.println("SQL error: " + sqlEx.getMessage());
			sqlEx.printStackTrace();
		}

		return resultList;
	}

	public void initializeSchema() throws SQLException {
		try (Connection conn = DriverManager.getConnection(DB_URL, USER, PASSWORD)) {
			Statement stmt = conn.createStatement();
			stmt.execute("CREATE TABLE EMPLOYEES (ID NUMBER PRIMARY KEY, NAME VARCHAR2(100), DEPARTMENT VARCHAR2(50))");
			stmt.execute("INSERT INTO EMPLOYEES VALUES (1, 'Alice', 'IT')");
			stmt.execute("INSERT INTO EMPLOYEES VALUES (2, 'Bob', 'HR')");
		}
	}
}
