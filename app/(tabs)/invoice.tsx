import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    SafeAreaView
} from 'react-native';


import InvoiceItem, { Invoice } from '../../src/components/InvoiceItem';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { router } from 'expo-router';



const API_BASE_URL = 'https://redchilli.lk/api';     // ← your real base URL
const INVOICES_ENDPOINT = '/invoices';               // invoices endpoint
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_IF_NEEDED';      // if your API needs auth

type RootStackParamList = {
    InvoiceList: undefined; // The current screen
    NewInvoice: undefined;  // The target screen when adding a new invoice
    // Add other screens here, e.g., InvoiceDetails: { id: number }
};
type InvoiceListProps = NativeStackScreenProps<RootStackParamList, 'InvoiceList'>;

export default function App({ navigation }: InvoiceListProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchKey, setSearchKey] = useState('');
    const [currentSearchInput, setCurrentSearchInput] = useState('');

    const fetchInvoices = useCallback(async (pageNumber: number, key = searchKey, isRefresh = false) => {
        if (pageNumber > totalPages && !isRefresh) return;

        setLoading(true);
        setError(null);

        try {
            // Construct URL — adjust query param names if your API is different
            const url = `${API_BASE_URL}${INVOICES_ENDPOINT}?page=${pageNumber}&searchKey=${encodeURIComponent(key)}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    // Include authorization if needed
                    ...(AUTH_TOKEN ? { 'Authorization': `Bearer ${AUTH_TOKEN}` } : {}),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const jsonResponse = await response.json();
            // **Important**: You need to know how your API returns data:
            // For example, does redchilli.lk/api/invoices return:
            // { data: [...], current_page: 1, last_page: 5, total: 100 }
            // or something else? Adjust the destructuring accordingly.

            const fetched = jsonResponse.data; 

            // Example: if API returns something like { data: { data: [...], current_page: ..., last_page: ... } }
            // You may need: const fetched = jsonResponse.data

            setInvoices(prev =>
                pageNumber === 1 || isRefresh || key !== searchKey
                    ? fetched.data
                    : [...prev, ...fetched.data]
            );

            setPage(fetched.current_page);
            setTotalPages(fetched.last_page);

        } catch (err) {
            console.error('API fetch error:', err);
            const message =
                err instanceof Error
                    ? err.message
                    : typeof err === 'string'
                        ? err
                        : 'An unexpected error occurred';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [searchKey, totalPages]);

    useEffect(() => {
        setPage(1);
        fetchInvoices(1, searchKey, true);
    }, [searchKey]);

    const handleSearchSubmit = () => {
        setSearchKey(currentSearchInput);
    };

    const handleClearSearch = () => {
        setSearchKey('');
        setCurrentSearchInput('');
    };

    const loadMore = () => {
        if (!loading && page < totalPages) {
            fetchInvoices(page + 1);
        }
    };
  const handleAddNewInvoice = () => {
    router.push('/new-invoice');   // Navigate to new invoice page
};

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Invoice List</Text>

            <View style={styles.searchRow}>
               <TouchableOpacity style={styles.newInvoiceBtn} onPress={handleAddNewInvoice}>
                    <Text style={styles.newInvoiceText}>+ Add New Invoice</Text>
                </TouchableOpacity>
                <TextInput
                    value={currentSearchInput}
                    onChangeText={setCurrentSearchInput}
                    placeholder="Search Invoice No..."
                    style={styles.input}
                />
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearchSubmit}>
                    <Text style={styles.btnText}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clearBtn} onPress={handleClearSearch}>
                    <Text style={styles.btnText}>Clear</Text>
                </TouchableOpacity>
            </View>

            {error && invoices.length === 0 && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => fetchInvoices(1, searchKey, true)}>
                        <Text style={styles.retryBtn}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={invoices}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => <InvoiceItem item={item} />}
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    loading ? (
                        <ActivityIndicator size="large" color="#10B981" style={{ marginVertical: 20 }} />
                    ) : null
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
    header: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 20, color: '#111827' },
    searchRow: { flexDirection: 'row', marginBottom: 12 },
    input: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB' },
    searchBtn: { marginLeft: 8, backgroundColor: '#10B981', paddingHorizontal: 12, justifyContent: 'center', borderRadius: 8 },
    clearBtn: { marginLeft: 8, backgroundColor: '#EF4444', paddingHorizontal: 12, justifyContent: 'center', borderRadius: 8 },
    btnText: { color: '#fff', fontWeight: '600' },
    errorBox: { padding: 20, backgroundColor: '#FEE2E2', borderRadius: 10, marginVertical: 20 },
    errorText: { color: '#B91C1C', fontSize: 16, marginBottom: 10 },
    retryBtn: { color: '#1D4ED8', fontWeight: '700' },
    newInvoiceBtn: {
        backgroundColor: '#059669', // Deep Green
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginRight: 8,
        height: 40, // Uniform height
        justifyContent: 'center',
    },
    newInvoiceText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
