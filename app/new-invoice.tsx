import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Modal } from "react-native";

const API_BASE_URL = "https://redchilli.lk/api";
const INVOICES_ENDPOINT = "/max_inv_no";
const CUSNAME_ENDPOINT = "/cusname";

export default function NewInvoice() {
  const [invoiceNo, setInvoiceNo] = useState("");

  // customer type
  const [customerType, setCustomerType] = useState<string | null>(null);
  const [openCustomerType, setOpenCustomerType] = useState(false);

  // customer phone dropdown
  const [openPhone, setOpenPhone] = useState(false);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [customerList, setCustomerList] = useState<
    { label: string; value: string; name: string; name_address: string; cus_id: string }[]
  >([]);

  // customer name auto-filled
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
   const [cus_id, setcusid] = useState("");

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Fetch max invoice number
  useEffect(() => {
    const loadMaxInvoiceNo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${INVOICES_ENDPOINT}`);
        const data = await response.json();
        setInvoiceNo(data.data || "");
      } catch (error) {
        console.error("Error fetching max invoice number:", error);
      }
    };
    loadMaxInvoiceNo();
  }, []);

  // Load customers + phone + name
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${CUSNAME_ENDPOINT}`);
        const data = await response.json();

        // Convert API result → dropdown format with phone & name
        const list = data.data.map(
          (c: { phone: string; customer_name: string; address: string ; cus_id: string}) => ({
            label: c.phone,
            value: c.phone,
            name: c.customer_name,
            name_address: c.address, 
            cus_id: c.cus_id,// store name for auto-fill
          })
        );

        setCustomerList(list);
      } catch (error) {
        console.error("Error fetching customer list:", error);
      }
    };

    loadCustomers();
  }, []);

  // Auto-fill customer name when phone selected
  useEffect(() => {
    if (customerPhone) {
      const selected = customerList.find((c) => c.value === customerPhone);
      if (selected) {
        setCustomerName(selected.name);
        setAddress(selected.name_address);
        setcusid(selected.cus_id);
      }
    } else {
      setCustomerName("");
      setAddress("");
      setcusid("");
    }
  }, [customerPhone]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (err) {
        console.warn("Camera permission error", err);
        setHasPermission(false);
      }
    })();
  }, []);

  const onBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScannerOpen(false);

    // use scanned data as phone (or adapt if you use different format)
    setCustomerPhone(data);

    // allow another scan after short delay (so modal can re-open later)
    setTimeout(() => setScanned(false), 800);
  };

  const handleSave = async () => {
    try {
      const payload = {
        invoice_no: invoiceNo,
        customer_type: customerType,
        customer_phone: customerPhone,
        customer_name: customerName,
        address: address,
         cus_id: cus_id,
      };

      const response = await fetch("https://redchilli.lk/api/save_inv", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert("Invoice saved successfully!"); 
        router.back();
      } else {
        alert("Failed to save invoice: " + (data.message || ""));
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Error saving invoice. Please try again.");
    }
  };

  if (hasPermission === false) {
    // we still show the screen but scanner button will notify user
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>New Invoice</Text>

      {/* Invoice Number */}
      <Text style={styles.label}>Inv Number</Text>
      <TextInput
        style={[styles.input, { backgroundColor: "#E5E7EB" }]}
        value={invoiceNo}
        editable={false}
      />
      

      {/* CUSTOMER TYPE */}
      <View style={{ zIndex: 3000 }}>
        <Text style={styles.label}>Customer Type</Text>
        <DropDownPicker
          open={openCustomerType}
          value={customerType}
          items={[
            { label: "Walking Customer", value: "1" },
            { label: "Online Customer", value: "2" },
            { label: "Redex", value: "3" },
          ]}
          setOpen={setOpenCustomerType}
          setValue={setCustomerType}
          searchable
          placeholder="Select Customer Type"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />
      </View>

      <View style={{ zIndex: 2000, marginTop: 10 }}>
        <Text style={styles.label}>Customer Phone</Text>
        <DropDownPicker
          open={openPhone}
          value={customerPhone}
          items={customerList}
          setOpen={setOpenPhone}
          setValue={setCustomerPhone}
          searchable
          placeholder="Select Phone Number"
          searchPlaceholder="Search phone…"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />
      </View>

      {/* AUTO-FILLED CUSTOMER NAME */}
      <Text style={styles.label}>Customer Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: "#E5E7EB" }]}
        value={customerName}
        editable={false}
        placeholder="Customer name "
      />

      <Text style={styles.label}>Customer Address</Text>
      <TextInput
        style={[styles.input, { backgroundColor: "#E5E7EB" }]}
        value={address}
        editable={false}
        placeholder="Customer Address "
      />

      <TouchableOpacity
        style={{
          backgroundColor: "#2563EB",
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
        }}
        onPress={() => setScannerOpen(true)}
      >
        <Text
          style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
        >
          Scan Barcode
        </Text>
      </TouchableOpacity>

      {/* SAVE BUTTON */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Invoice</Text>
      </TouchableOpacity>

      <Modal visible={scannerOpen} animationType="slide">
        <View style={{ flex: 1 }}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : onBarCodeScanned}
            style={{ flex: 1 }}
          />
          <TouchableOpacity
            onPress={() => setScannerOpen(false)}
            style={styles.closeScannerButton}
          >
            <Text style={styles.closeScannerText}>Close Scanner</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F3F4F6" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#374151",
  },
  saveButton: {
    backgroundColor: "#059669",
    padding: 16,
    borderRadius: 8,
    marginTop: 25,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  scanButton: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  scanText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  closeScannerButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    borderRadius: 8,
  },
  closeScannerText: { color: "#fff", fontWeight: "bold" },
});

