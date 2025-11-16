# Database Values Guide for Today's Tablets

## What Values to Put in the Database

To display tablets in the "Today's Tablets" section, you need to set values in the `Morning`, `Evening`, and `Night` columns of the `prescriptions` table.

### Column Values:

- **Morning**: Number of tablets to take in the morning (e.g., "1", "2", "0")
- **Evening**: Number of tablets to take in the evening (e.g., "1", "2", "0")
- **Night**: Number of tablets to take at night (e.g., "1", "2", "0")

### Example Values:

**Example 1: Once daily in the morning**
```
Morning: "1"
Evening: "0"
Night: "0"
```
Total: 1 tablet per day

**Example 2: Twice daily (morning and evening)**
```
Morning: "1"
Evening: "1"
Night: "0"
```
Total: 2 tablets per day

**Example 3: Three times daily**
```
Morning: "1"
Evening: "1"
Night: "1"
```
Total: 3 tablets per day

**Example 4: Different dosages**
```
Morning: "2"
Evening: "1"
Night: "1"
```
Total: 4 tablets per day

### How to Update Database:

#### Option 1: Use the Update Script
Run this command to automatically update your prescriptions:
```bash
node update-prescription-values.js
```

#### Option 2: Manual SQL Update
You can manually update using SQL:
```sql
UPDATE prescriptions 
SET Morning = '1', Evening = '1', Night = '0'
WHERE name = 'AMOXICILLIN';
```

#### Option 3: Upload Prescription Image
When you upload a prescription image with the proper format (see `PRESCRIPTION_FORMAT.md`), the system will automatically extract and set these values.

### Current Database Status:

To check what values are currently in your database, run:
```bash
node check-prescriptions.js
```

### Expected Format in Prescription Image:

For the OCR to extract these values, your prescription should include:
```
Rx: Medication Name
Morning: 1 tablet
Evening: 1 tablet
Night: 0 tablet
```

The system will automatically parse and set these values when you upload a prescription image.

