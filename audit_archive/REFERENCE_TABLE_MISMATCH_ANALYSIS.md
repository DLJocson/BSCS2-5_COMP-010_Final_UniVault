# 🔍 UniVault Reference Table Mismatch Detection Report

## 📋 Executive Summary

After scanning your UniVault system across the full registration stack (Frontend → Backend → Database), I've identified **multiple critical reference table mismatches** that are likely causing constraint errors during registration.

---

## 🚨 Critical Issues Found

### 1. **Civil Status Mapping Mismatch**

**Problem:** Frontend dropdown options don't match backend mapping or database seed data

**Frontend (`registration3.html`):**
```html
<option value="Single">Single</option>
<option value="Married">Married</option>
<option value="Divorced">Divorced</option>
<option value="Widowed">Widowed</option>
<option value="Separated">Separated</option>
```

**Backend Mapping (`fieldMapper.js`):**
```javascript
'legally separated': 'CS03',
'divorced': 'CS04',
'widowed': 'CS06',
```

**Database Codes (`02_seed_data.sql`):**
```sql
('CS03','Legally Separated'),
('CS04','Divorced'),
('CS05','Annulled'),  -- Missing from frontend!
('CS06','Widow/er');
```

**Issues:**
- Frontend shows "Separated" but backend expects "Legally Separated"
- Frontend shows "Widowed" but database stores "Widow/er" 
- Missing "Annulled" option in frontend
- Case sensitivity issues in mapping

---

### 2. **Fund Source Value Mismatch**

**Problem:** Frontend checkbox values don't match backend mapping keys

**Frontend (`registration5.html`):**
```html
<input type="checkbox" value="employed_fixed"> Employed - Fixed Income
<input type="checkbox" value="self_employed_fixed"> Self-Employed - Fixed Income
```

**Backend Mapping (`fieldMapper.js`):**
```javascript
'employed - fixed income': 'FS001',
'self-employed - business income': 'FS003',  // Note: "business" not "fixed"
```

**Issues:**
- Frontend sends `employed_fixed` but backend expects `employed - fixed income`
- Frontend has "Self-Employed - Fixed Income" but database/backend has "Self-Employed - Business Income"
- Underscore vs hyphen vs space inconsistencies

---

### 3. **Employment Position Code Constraint Risk**

**Database Schema:** `position_code CHAR(4)` with constraint `CHECK (position_code REGEXP '^EP[0-9]{2}$')`

**Backend Mapping (`registration.js`):**
```javascript
const positionMap = {
    'Owner / Director / Officer': 'EP01',
    'Non-Officer / Employee': 'EP02',
    'Government Employee': 'EP05'  // EP05 exists in DB, EP06 also exists
};
```

**Potential Issue:** If frontend sends unmapped position text, it could exceed CHAR(4) limit or fail regex constraint.

---

### 4. **Missing Work Nature Code Validation**

**Database Schema:** `work_nature_code CHAR(3)` with constraint `CHECK (work_nature_code REGEXP '^[A-Z]{3}$')`

**Current Issue:** No comprehensive mapping found in backend for work nature codes, but database has strict 3-character uppercase constraint.

---

### 5. **Contact Type Code Hardcoding**

**Backend (`registration.js`):**
```javascript
// Hardcoded contact type codes
[cif_number, 'CT01', phoneNumber] // CT01 = Mobile phone
[cif_number, 'CT03', emailAddress] // CT03 = Email - BUT CT03 is "Work Number" in DB!
```

**Database Reality (`02_seed_data.sql`):**
```sql
('CT01','Mobile Number'),
('CT02','Telephone Number'),
('CT03','Work Number'),        -- NOT email!
('CT04','Personal Email'),     -- This should be CT04
('CT05','Work Email'),
```

**Critical Error:** Email is being stored with CT03 (Work Number) instead of CT04 (Personal Email)!

---

### 6. **Address Type Code Hardcoding**

**Backend assumes:**
- `'AD01'` = Home address
- `'AD02'` = Alternate address

**Database confirms this is correct**, but no validation exists if frontend sends different codes.

---

## 🔧 Column Length Analysis

### Reference Table Constraints:
| Table | Code Column | Length | Format | Potential Overflow Risk |
|-------|-------------|--------|---------|------------------------|
| `CIVIL_STATUS_TYPE` | `civil_status_code` | `CHAR(4)` | `^CS[0-9]{2}$` | ✅ Safe |
| `EMPLOYMENT_POSITION` | `position_code` | `CHAR(4)` | `^EP[0-9]{2}$` | ✅ Safe |
| `FUND_SOURCE_TYPE` | `fund_source_code` | `CHAR(5)` | `^FS[0-9]{3}$` | ✅ Safe |
| `WORK_NATURE_TYPE` | `work_nature_code` | `CHAR(3)` | `^[A-Z]{3}$` | ⚠️ **Risk if unmapped** |
| `CONTACT_TYPE` | `contact_type_code` | `CHAR(4)` | `^CT[0-9]{2}$` | ✅ Safe |
| `ADDRESS_TYPE` | `address_type_code` | `CHAR(4)` | `^AD[0-9]{2}$` | ✅ Safe |
| `ID_TYPE` | `id_type_code` | `CHAR(3)` | `^[A-Z]{3}$` | ⚠️ **Risk if unmapped** |

---

## 🎯 Recommended Fixes

### Priority 1: Frontend-Backend Alignment

1. **Fix Civil Status Options:**
```html
<!-- registration3.html -->
<option value="Single">Single</option>
<option value="Married">Married</option>
<option value="Legally Separated">Legally Separated</option>
<option value="Divorced">Divorced</option>
<option value="Annulled">Annulled</option>
<option value="Widow/er">Widow/er</option>
```

2. **Fix Fund Source Checkbox Values:**
```html
<!-- registration5.html -->
<input type="checkbox" value="Employed - Fixed Income"> Employed - Fixed Income
<input type="checkbox" value="Self-Employed - Business Income"> Self-Employed - Business Income
```

3. **Fix Contact Type Code Bug:**
```javascript
// registration.js - Fix email contact type
[cif_number, 'CT04', emailAddress] // CT04 = Personal Email (not CT03)
```

### Priority 2: Add Missing Validation

4. **Add Work Nature Code Mapping:**
```javascript
// Add to fieldMapper.js
const workNatureMap = {
    'accounting': 'ACT',
    'legal services': 'LEG',
    'architecture': 'ANE',
    // ... map all work nature options
};
```

5. **Add Position Code Validation:**
```javascript
// Enhanced position mapping with validation
function mapPositionToCode(position) {
    const mapped = positionMap[position];
    if (!mapped) {
        throw new Error(`Invalid position: ${position}`);
    }
    return mapped;
}
```

### Priority 3: Data Validation Triggers

6. **Add Frontend Validation:**
```javascript
// Pre-submission validation
function validateRegistrationData(data) {
    // Validate all reference codes exist and match constraints
    if (!data.civil_status_code?.match(/^CS\d{2}$/)) {
        throw new Error('Invalid civil status code format');
    }
    // ... add more validations
}
```

---

## 🧪 Testing Strategy

1. **Test each dropdown with invalid values**
2. **Test constraint violations (too long values, wrong format)**
3. **Test foreign key constraint failures**
4. **Verify mapping consistency across all reference tables**

---

## 📊 Impact Assessment

**High Risk Issues:**
- Contact type CT03/CT04 bug (affects all email storage)
- Civil status "Separated" vs "Legally Separated" mismatch
- Fund source value format inconsistencies

**Medium Risk Issues:**
- Missing work nature code mapping
- Position code validation gaps

**Low Risk Issues:**
- Column length overflows (most are properly constrained)

This analysis provides a roadmap to eliminate reference table mismatches and prevent constraint errors during registration.
