import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
// NOTE: All React Native components (View, Text, StyleSheet, etc.) have been replaced 
// with standard React Web components (div, p, input, button) and Tailwind CSS classes 
// to ensure compilation in this environment.

// --- Configuration (Update these values in your project) ---
// IMPORTANT: Change this URL to your live Laravel API endpoint to disable mocking!
const API_BASE_URL = 'https://MOCK_DATA_ACTIVE.com/api'; 
const MOCK_AUTH_TOKEN = 'YOUR_SANCTUM_TOKEN_HERE'; 

// Define isMocking here so it's accessible throughout the App component.
const isMocking = API_BASE_URL.includes('MOCK_DATA_ACTIVE.com'); 

// Component to display a single invoice item
const InvoiceItem = React.memo(({ item }) => {
    const { inv_no, grand_total, customer_id, date } = item || {};

    const formattedTotal = grand_total 
        ? `$${parseFloat(grand_total).toFixed(2)}` 
        : '$0.00';

    const formattedDate = date 
        ? new Date(date).toLocaleDateString() 
        : 'N/A';

    return (
        <View className="bg-white rounded-xl p-4 mb-3 shadow border-l-4 border-emerald-500">
            <View className="flex-row justify-between items-center mb-2 border-b pb-2 border-gray-200">
                <Text className="text-lg font-semibold text-gray-800">
                    INV: {inv_no || 'Unknown'}
                </Text>

                <Text className="text-xl font-extrabold text-emerald-600">
                    {formattedTotal}
                </Text>
            </View>

            <Text className="text-sm text-gray-500">
                Customer ID: <Text className="font-medium text-gray-700">{customer_id || 'N/A'}</Text>
            </Text>

            <Text className="text-sm text-gray-500">
                Date: <Text className="font-medium text-gray-700">{formattedDate}</Text>
            </Text>
        </View>
    );
});

InvoiceItem.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.number.isRequired,
        inv_no: PropTypes.string,
        grand_total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        customer_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        date: PropTypes.string,
    }).isRequired,
};

// Main Application Component
const App = () => {
    const [invoices, setInvoices] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchKey, setSearchKey] = useState('');
    const [currentSearchInput, setCurrentSearchInput] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // --- Data Fetching Logic (Same as before) ---
    const fetchInvoices = useCallback(async (pageNumber: number, key = searchKey, isRefresh = false) => {
        if (pageNumber > totalPages && totalPages !== 1 && !isRefresh && pageNumber > 1) {
            console.log("Reached last page.");
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            let jsonResponse;

            if (isMocking) {
                // --- MOCK API CALL SIMULATION ---
                const MOCK_DATA = Array.from({ length: 50 }, (_, i) => ({
                    id: i + 1,
                    inv_no: `INV-${1000 + i}`,
                    grand_total: (50 + Math.random() * 500).toFixed(2),
                    customer_id: `CUST-${Math.floor(Math.random() * 900) + 100}`,
                    date: new Date(Date.now() - (i * 86400000)).toISOString().split('T')[0],
                }));

                const filteredData = key 
                    ? MOCK_DATA.filter(item => item.inv_no.toLowerCase().includes(key.toLowerCase()))
                    : MOCK_DATA;

                const perPage = 10;
                const totalItems = filteredData.length;
                const mockTotalPages = Math.ceil(totalItems / perPage);
                const start = (pageNumber - 1) * perPage;
                const end = start + perPage;
                const pageData = filteredData.slice(start, end);

                jsonResponse = {
                    status: 'success',
                    data: {
                        data: pageData,
                        current_page: pageNumber,
                        last_page: mockTotalPages,
                        total: totalItems,
                    }
                };
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } else {
                // --- REAL API CALL (Active when API_BASE_URL is changed) ---
                const url = `${API_BASE_URL}/invoices?page=${pageNumber}&searchKey=${key}`;
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                jsonResponse = await response.json();
            }
            
            if (jsonResponse.status === 'error') {
                throw new Error(jsonResponse.message || 'Failed to fetch data');
            }
            
            const fetchedData = jsonResponse.data;

            setInvoices(prevInvoices => 
                pageNumber === 1 || isRefresh || key !== searchKey 
                ? fetchedData.data
                : [...prevInvoices, ...fetchedData.data]
            );

            setTotalPages(fetchedData.last_page);
            setPage(fetchedData.current_page);
            setIsInitialLoad(false);

        } catch (err) {
            console.error('API Error:', err);
            setError(err.message || 'An error occurred during API call.');
        } finally {
            setLoading(false);
        }
    }, [searchKey, totalPages]);

    // Effect for initial load and search key changes
    useEffect(() => {
        setPage(1); 
        fetchInvoices(1, searchKey, true);
    }, [searchKey]);


    // --- UI Handlers ---

    // Load next page for infinite scroll
    const handleLoadMore = () => {
        if (!loading && page < totalPages) {
            fetchInvoices(page + 1, searchKey);
        }
    };
    
    // Apply search filter when user submits text
    const handleSearchSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault(); 
        if (currentSearchInput !== searchKey) {
            setSearchKey(currentSearchInput);
        }
    };
    
    // Clear search key and trigger a fresh fetch
    const handleClearSearch = () => {
        setSearchKey('');
        setCurrentSearchInput('');
    };

    // --- Render Functions (Converted to Web/Tailwind) ---

    // Displays if there's an error
    const renderError = () => (
        <div className="min-h-screen p-5 flex flex-col justify-center items-center bg-gray-100">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Error Retrieving Data</h1>
            <p className="text-lg text-gray-700 mb-4 text-center">
                {error}
            </p>
            <p className="text-sm text-gray-500 text-center">
                Please check your API URL, authentication token, and network connection.
            </p>
            <button
                onClick={() => fetchInvoices(1, searchKey, true)}
                className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition"
            >
                Tap to Retry
            </button>
        </div>
    );

    // Displays if no invoices are found
    const renderEmpty = () => (
        <div className="text-center mt-10 p-4 bg-white rounded-lg shadow-md mx-4">
            <p className="text-xl text-gray-500 font-medium">No invoices found.</p>
            {searchKey.length > 0 && <p className="text-sm text-gray-400">Try a different search term or clear the filter.</p>}
        </div>
    );

    return (
        // The script and style are included here for web execution
        <div className="min-h-screen bg-gray-100 font-sans p-4">
             <script src="https://cdn.tailwindcss.com"></script>
             <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
                body {
                    font-family: 'Inter', sans-serif;
                }
             `}</style>
             
            <header className="py-4 mb-4 border-b border-gray-200 sticky top-0 bg-gray-100 z-10">
                <h1 className="text-3xl font-extrabold text-center text-gray-900">
                    Mobile Invoice List
                </h1>
            </header>

            {/* Error Handling for initial state */}
            {error && invoices.length === 0 ? renderError() : (
                <>
                    {/* Search Bar and Controls */}
                    <form onSubmit={handleSearchSubmit} className="flex space-x-2 mb-6">
                        <input
                            type="text"
                            className="flex-1 h-10 border border-gray-300 rounded-lg px-4 bg-white text-gray-800 placeholder-gray-400 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition"
                            placeholder="Search by Invoice No..."
                            value={currentSearchInput}
                            onChange={(e) => setCurrentSearchInput(e.target.value)}
                        />
                         <button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
                        >
                            Search
                        </button>
                        <button 
                            type="button"
                            onClick={handleClearSearch}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
                        >
                            Clear
                        </button>
                    </form>

                    {/* Mocking Alert */}
                    {isMocking && (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
                            <span className="block sm:inline font-bold">MOCK DATA ACTIVE:</span> The API call is currently mocked. Change <code className="font-mono text-xs">API_BASE_URL</code> to your backend URL to fetch real data.
                        </div>
                    )}

                    {/* List of Invoices */}
                    <div className="space-y-3 pb-8">
                        {invoices.length > 0 ? (
                            invoices.map(item => (
                                <InvoiceItem key={item.id} item={item} />
                            ))
                        ) : (
                            !loading && renderEmpty()
                        )}
                    </div>

                    {/* Loading Indicator and Load More Button */}
                    <div className="mt-8 flex flex-col items-center">
                        {loading && (
                            <div className="flex items-center space-x-3 text-emerald-600">
                                {/* Simple spinner SVG */}
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"></path>
                                </svg>
                                <p className="text-lg font-medium">Loading...</p>
                            </div>
                        )}

                        {/* Load More Button */}
                        {!loading && page < totalPages && (
                            <button
                                onClick={handleLoadMore}
                                className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                Load More Invoices ({page} / {totalPages})
                            </button>
                        )}

                        {/* End of List Message */}
                        {!loading && page === totalPages && invoices.length > 0 && (
                            <p className="mt-4 text-gray-500 text-sm">
                                You have viewed all {invoices.length} invoices.
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default App;