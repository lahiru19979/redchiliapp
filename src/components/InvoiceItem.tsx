import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface Invoice {
    id: number;
    inv_no?: string;
    grand_total?: string | number;
    cus_name?: string ;
    date?: string;
}

interface InvoiceItemProps {
    item: Invoice;
}

// eslint-disable-next-line react/display-name
const InvoiceItem: React.FC<InvoiceItemProps> = memo(({ item }) => {
    const { inv_no, grand_total, cus_name, date } = item;

    const formattedTotal = grand_total ? `${grand_total}` : '$0.00';
    const formattedDate = date ? new Date(date).toLocaleDateString() : 'N/A';

    return (
        <TouchableOpacity style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.invoiceNo}>INV: {inv_no || 'Unknown'}</Text>
                <Text style={styles.total}>{formattedTotal}</Text>
            </View>

            <Text style={styles.text}>
                Customer ID: <Text style={styles.bold}>{cus_name || 'N/A'}</Text>
            </Text>

            <Text style={styles.text}>
                Date: <Text style={styles.bold}>{formattedDate}</Text>
            </Text>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 6, marginBottom: 6 },
    invoiceNo: { fontSize: 18, fontWeight: '600', color: '#333' },
    total: { fontSize: 20, fontWeight: '800', color: '#10B981' },
    text: { fontSize: 14, color: '#666', marginBottom: 2 },
    bold: { fontWeight: '600', color: '#333' },
});

export default InvoiceItem;
