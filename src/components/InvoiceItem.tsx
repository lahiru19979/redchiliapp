import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export interface Invoice {
  id: number;
  inv_no?: string;
  grand_total?: string | number;
  cus_name?: string;
  inv_date?: string;
}

interface InvoiceItemProps {
  item: Invoice;
  onShare?: (item: Invoice) => void; // Optional share handler
  onEdit?: (item: Invoice) => void; // Optional edit handler
}

// eslint-disable-next-line react/display-name
const InvoiceItem: React.FC<InvoiceItemProps> = memo(
  ({ item, onShare, onEdit }) => {
    const { inv_no, grand_total, cus_name, inv_date } = item;

    // Helper functions for button presses (add your actual logic here)
    const handleShare = () => {
      if (onShare) {
        onShare(item);
      } else {
        console.log("Share button pressed for invoice:", item.id);
        // Implement sharing logic (e.g., share API, modal)
      }
    };

    const handleEdit = () => {
      if (onEdit) {
        onEdit(item);
      } else {
        console.log("Edit button pressed for invoice:", item.id);
        // Implement editing logic (e.g., navigation to edit screen)
      }
    };

    const formattedTotal = grand_total ? `${grand_total}` : "$0.00";
    const formattedDate = inv_date
      ? new Date(inv_date).toLocaleDateString()
      : "N/A";

    return (
      <TouchableOpacity style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.invoiceNo}>INV: {inv_no || "Unknown"}</Text>
        </View>

        <Text style={styles.text}>
          Customer ID: <Text style={styles.bold}>{cus_name || "N/A"}</Text>
        </Text>

        <Text style={styles.text}>
          Date: <Text style={styles.bold}>{formattedDate}</Text>
        </Text>
        <View style={styles.totalAndActionsRow}>
          {/* Total Display */}
          <View>
            <Text style={styles.text}>
              Net Amount:
              <Text style={styles.total}>{formattedTotal}</Text>
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 6,
    marginBottom: 6,
  },
  invoiceNo: { fontSize: 18, fontWeight: "600", color: "#333" },
  total: { fontSize: 20, fontWeight: "800", color: "#10B981" },
  totalAndActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Aligns total to left and buttons to right
    alignItems: "center", // Vertically centers items in the row
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  text: { fontSize: 14, color: "#666", marginBottom: 2 },
  bold: { fontWeight: "600", color: "#333" },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end", // Pushes buttons to the right
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    justifyContent: "flex-end",
    borderRadius: 8,
    marginLeft: 10, // Space between buttons
    alignItems: "center",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  shareButton: {
    backgroundColor: "#6C757D", // Gray color for share
  },
  editButton: {
    backgroundColor: "#007BFF", // Blue color for edit
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default InvoiceItem;
