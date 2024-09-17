import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const Report = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all reports from Firestore
  const fetchReports = async () => {
    setLoading(true);
    try {
      const reportsCollection = collection(db, "reports");
      const reportsSnapshot = await getDocs(reportsCollection);
      const reportsList = reportsSnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Document data:", data); // Log document data
        return {
          id: doc.id,
          content: data.content || "No content available",
          createdAt: data.createdAt ? data.createdAt.seconds * 1000 : null, // Handle missing createdAt
        };
      });
      setReports(reportsList);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Reports</Text>
      {reports.length === 0 ? (
        <Text style={styles.noReports}>No reports found.</Text>
      ) : (
        reports.map((report, index) => (
          <View key={report.id} style={styles.reportItem}>
            <Text style={styles.reportTitle}>Report {index + 1}</Text>
            <Text>{report.content}</Text>
            <Text style={styles.timestamp}>
              Created At:{" "}
              {report.createdAt
                ? new Date(report.createdAt).toLocaleString()
                : "Unknown"}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default Report;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  noReports: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
    marginTop: 50,
  },
  reportItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  timestamp: {
    marginTop: 10,
    fontStyle: "italic",
    color: "gray",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
