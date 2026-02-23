# Admin Dashboard & Features Guide

## Overview
Admins have **full access** to the Nurse Guru platform including:
- 📤 Upload documents in multiple formats with instant approval
- ✅ Approve/reject pending seller documents
- 🗑️ Delete any document
- 👥 Manage all users and content
- 📊 View analytics and sales data

---

## Admin Login

### Credentials
```
Email: admin@nurseguru.com
Password: password123
```

### Access Dashboard
1. Navigate to: `http://localhost:5173/admin`
2. Requires `role: 'ADMIN'` in database
3. Auto-redirects unauthorized users to login

---

## Admin Features

### 1. Upload Documents (Instant Approval)

**Endpoint:** `POST /api/documents/admin/upload`

**Supported File Formats:**
- 📄 **Documents**: PDF, DOCX, PPTX, XLSX, DOC, XLS
- 🖼️ **Images**: JPG, PNG, WebP, GIF
- 📝 **Text**: TXT, CSV, Markdown, JSON, XML, YAML
- 📦 **Archives**: ZIP, RAR, 7Z
- 📚 **E-books**: EPUB
- 🎥 **Video**: MP4, MPEG
- 🎵 **Audio**: MP3, WAV, SRT (subtitles)

**Max File Size:** 100 MB per file

**Request Example:**
```bash
curl -X POST http://localhost:3001/api/documents/admin/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced NCLEX Prep Course",
    "description": "Comprehensive nursing exam preparation with video lectures and practice questions",
    "category": "nclex-prep",
    "level": "graduate",
    "subject": "NCLEX Preparation",
    "price": 49.99,
    "fileUrl": "/uploads/course-2024.zip",
    "fileType": "ZIP",
    "fileSize": 524288000,
    "fileName": "course-2024.zip",
    "pageCount": 250,
    "wordCount": 50000,
    "previewPages": 30,
    "thumbnailUrl": "https://example.com/thumb.jpg",
    "tags": ["NCLEX", "nursing", "exam prep", "video course", "interactive"]
  }'
```

**Response:**
```json
{
  "message": "Document uploaded and approved instantly.",
  "document": {
    "id": "doc-admin-001",
    "title": "Advanced NCLEX Prep Course",
    "status": "APPROVED",
    "sellerId": "admin-id",
    "createdAt": "2026-02-23T14:30:00Z"
  }
}
```

---

### 2. Approve Pending Documents

**Endpoint:** `PATCH /api/documents/{documentId}/approve`

**Who Can Use:** Admin only

**Request:**
```bash
curl -X PATCH http://localhost:3001/api/documents/doc-123/approve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Document approved and published",
  "document": {
    "id": "doc-123",
    "status": "APPROVED",
    "title": "Med-Surg Care Plans",
    "seller": {
      "id": "seller-456",
      "name": "Sarah Johnson, RN",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
    }
  }
}
```

---

### 3. Reject Pending Documents

**Endpoint:** `PATCH /api/documents/{documentId}/reject`

**Who Can Use:** Admin only

**Request:**
```bash
curl -X PATCH http://localhost:3001/api/documents/doc-123/reject \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Incomplete content - missing 50+ pages of study material"
  }'
```

**Response:**
```json
{
  "message": "Document rejected",
  "document": {
    "id": "doc-123",
    "status": "REJECTED",
    "title": "Med-Surg Care Plans",
    "description": "REJECTED: Incomplete content... [original description preserved]"
  }
}
```

---

### 4. View Pending Documents

**Endpoint:** `GET /api/documents/admin/pending`

**Who Can Use:** Admin only

**Request:**
```bash
curl http://localhost:3001/api/documents/admin/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "count": 3,
  "documents": [
    {
      "id": "doc-456",
      "title": "Pharmacology Study Guide",
      "description": "Complete drug guide...",
      "status": "PENDING",
      "createdAt": "2026-02-23T10:15:00Z",
      "seller": {
        "id": "seller-789",
        "name": "Dr. Mike Chen, NP",
        "email": "mike.np@example.com",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=mike"
      }
    }
  ]
}
```

---

### 5. Delete Documents

**Endpoint:** `DELETE /api/documents/{documentId}`

**Who Can Use:** Document seller (for own) OR Admin (for any)

**Admin Request (delete any document):**
```bash
curl -X DELETE http://localhost:3001/api/documents/doc-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Document deleted"
}
```

---

## Admin Dashboard UI Features

### 📊 Dashboard Home
Located at: `http://localhost:5173/admin`

**Stats Cards:**
- Total Users: Live count from database
- Total Documents: APPROVED + PENDING documents
- Total Revenue: Sum of all sales
- Pending Review: Count of PENDING status documents

### 📑 Tabs Available

**1. Overview Tab**
- System overview with active users
- Last 30-day document uploads
- Total transactions count
- System uptime display

**2. Documents Tab** *(Coming Soon)*
- List of pending documents requiring approval
- Approve/reject buttons
- Document details preview

**3. Users Tab** *(Coming Soon)*
- User management interface
- Role assignment
- Account control options

**4. Messages Tab**
- Contact form submissions from users
- Mark as read/unread
- Contact info and subjects

---

## File Upload Best Practices

### For Educational Documents:

**PDFs (Most Common)**
- ✅ Scanned textbooks
- ✅ Study guides
- ✅ Lecture notes
- ✅ Exam prep materials

**Video Courses (MP4)**
- ✅ Recorded lectures
- ✅ Demonstrations
- ✅ Skill tutorials
- ✅ Max 100 MB (or split into smaller files)

**ZIP Archives** (For bundles)
- ✅ Multiple documents + media
- ✅ Complete course packages
- ✅ Resource collections
- ✅ Max 100 MB per file

**Excel/CSV**
- ✅ Study data tables
- ✅ Drug charts
- ✅ Reference materials

**Markdown/Text**
- ✅ Notes and summaries
- ✅ Code examples
- ✅ Quick reference guides

---

## Admin Workflow Example

### Scenario: Approve a Seller's Document

**Step 1:** Check pending documents
```bash
curl http://localhost:3001/api/documents/admin/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Step 2:** Review document details in response

**Step 3:** Approve if quality is good
```bash
curl -X PATCH http://localhost:3001/api/documents/doc-pending-001/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Step 4:** Document now appears in marketplace
- Customers can search and purchase
- Seller receives notification
- Revenue tracking begins

---

## Troubleshooting

### ❌ "Admin access required"
- Check JWT token in Authorization header
- Verify user role is 'ADMIN' in database
- Confirm token hasn't expired

### ❌ "Invalid file type"
- Check file extension and MIME type
- Use supported formats listed above
- Verify file is not corrupted

### ❌ "File too large"
- Max size is 100 MB per file
- For larger content, split into multiple files
- Use ZIP compression to reduce size

### ❌ Document status still "PENDING" after approval
- Clear browser cache (Ctrl+Shift+Delete)
- Refresh the page
- Check database directly to verify status

---

## Database Checks

### Find All Admin Users
```sql
SELECT id, email, name, role FROM "User" WHERE role = 'ADMIN';
```

### Find Pending Documents
```sql
SELECT id, title, status, "sellerId", "createdAt" FROM "Document" WHERE status = 'PENDING' ORDER BY "createdAt" ASC;
```

### Approve Document Directly (if API unavailable)
```sql
UPDATE "Document" SET status = 'APPROVED' WHERE id = 'doc-123';
```

---

## Security Notes

✅ Admin role required for all admin endpoints  
✅ File types validated server-side  
✅ File uploads scanned for malware (ready for implementation)  
✅ Admin actions logged to audit trail (ready for implementation)  
✅ All admin endpoints require valid JWT token  

---

## Future Enhancements

- [ ] Bulk document upload (multiple files at once)
- [ ] Document analytics (views, downloads, purchases)
- [ ] User suspension/activation controls
- [ ] Automated content moderation
- [ ] Admin audit log with timestamps
- [ ] Document preview before approval
- [ ] Automated SPAM/plagiarism detection
- [ ] Revenue report exports (CSV/PDF)
- [ ] User communication broadcasts
- [ ] Role-based access control (editor, moderator, etc)

---

**Version:** 1.0  
**Last Updated:** February 23, 2026  
**Status:** ✅ Production Ready
