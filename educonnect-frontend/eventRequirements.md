# Event Form Management APIs with Role-Based Access Control

## Current Implementation Status

### ✅ **Currently Implemented APIs**

#### 1. **Create Registration Form**
- **Endpoint**: `POST /api/events/{eventId}/forms/`
- **Description**: Create a new registration form for an event
- **Request Body**: `CreateFormRequestDTO`
- **Response**: `CreateFormResponseDTO`
- **Access Control**: 
  - ✅ **Event Creator/Owner**: Full access
  - ❌ **Event Organizer**: Should have access (not implemented)
  - ❌ **Event Moderator**: Should have access (not implemented)
  - ❌ **Participants**: No access
  - ❌ **Public**: No access

#### 2. **Get All Forms for Event**
- **Endpoint**: `GET /api/events/{eventId}/forms/`
- **Description**: Retrieve all forms associated with an event
- **Response**: `List<CreateFormResponseDTO>`
- **Access Control**:
  - ✅ **Event Creator/Owner**: Full access
  - ❌ **Event Organizer**: Should have access (not implemented)
  - ❌ **Event Moderator**: Should have access (not implemented)
  - ❌ **Participants**: Should have limited access to active forms only
  - ❌ **Public**: No access

---

## 🚨 **Missing Critical APIs (Need Implementation)**

### **Form Management APIs**

#### 3. **Update Registration Form**
- **Endpoint**: `PUT /api/events/{eventId}/forms/{formId}`
- **Description**: Update an existing registration form
- **Request Body**: `UpdateFormRequestDTO`
- **Response**: `CreateFormResponseDTO`
- **Access Control**:
  - ✅ **Event Creator/Owner**: Full access
  - ✅ **Event Organizer**: Full access
  - ✅ **Event Moderator**: Limited access (can't change critical settings)
  - ❌ **Participants**: No access
  - ❌ **Public**: No access

#### 4. **Delete Registration Form**
- **Endpoint**: `DELETE /api/events/{eventId}/forms/{formId}`
- **Description**: Delete a registration form (soft delete recommended)
- **Response**: `204 No Content`
- **Access Control**:
  - ✅ **Event Creator/Owner**: Full access
  - ✅ **Event Organizer**: Full access
  - ❌ **Event Moderator**: No access
  - ❌ **Participants**: No access
  - ❌ **Public**: No access

#### 5. **Get Single Form**
- **Endpoint**: `GET /api/events/{eventId}/forms/{formId}`
- **Description**: Get details of a specific form
- **Response**: `CreateFormResponseDTO`
- **Access Control**:
  - ✅ **Event Creator/Owner**: Full access
  - ✅ **Event Organizer**: Full access
  - ✅ **Event Moderator**: Read-only access
  - ✅ **Participants**: Access to active forms only
  - ❌ **Public**: No access

#### 6. **Toggle Form Status**
- **Endpoint**: `PATCH /api/events/{eventId}/forms/{formId}/status`
- **Description**: Activate/Deactivate a form
- **Request Body**: `{"isActive": true/false}`
- **Response**: `CreateFormResponseDTO`
- **Access Control**:
  - ✅ **Event Creator/Owner**: Full access
  - ✅ **Event Organizer**: Full access
  - ❌ **Event Moderator**: No access
  - ❌ **Participants**: No access
  - ❌ **Public**: No access

### **Form Field Management APIs**

#### 7. **Add Form Field**
- **Endpoint**: `POST /api/events/{eventId}/forms/{formId}/fields`
- **Description**: Add a new field to a form
- **Request Body**: `CreateFormFieldDTO`
- **Response**: `FormFieldDTO`
- **Access Control**:
  - ✅ **Event Creator/Owner**: Full access
  - ✅ **Event Organizer**: Full access
  - ✅ **Event Moderator**: Limited access (basic fields only)
  - ❌ **Participants**: No access
  - ❌ **Public**: No access

#### 8. **Update Form Field**
- **Endpoint**: `PUT /api/events/{eventId}/forms/{formId}/fields/{fieldId}`
- **Description**: Update an existing form field
- **Request Body**: `UpdateFormFieldDTO`
- **Response**: `FormFieldDTO`
- **Access Control**:
  - ✅ **Event Creator/Owner**: Full access
  - ✅ **Event Organizer**: Full access
  - ✅ **Event Moderator**: Limited access
  - ❌ **Participants**: No access
  - ❌ **Public**: No access

#### 9. **Delete Form Field**
- **Endpoint**: `DELETE /api/events/{eventId}/forms/{formId}/fields/{fieldId}`
- **Description**: Remove a field from a form
- **Response**: `204 No Content`
- **Access Control**:
  - ✅ **Event Creator/Owner**: Full access
  - ✅ **Event Organizer**: Full access
  - ❌ **Event Moderator**: No access
  - ❌ **Participants**: No access
  - ❌ **Public**: No access

#### 10. **Reorder Form Fields**
- **Endpoint**: `PATCH /api/events/{eventId}/forms/{formId}/fields/reorder`
- **Description**: Change the order of form fields
- **Request Body**: `{"fieldOrders": [{"fieldId": 1, "orderIndex": 1}]}`
- **Response**: `List<FormFieldDTO>`
- **Access Control**:
  - ✅ **Event Creator/Owner**: Full access
  - ✅ **Event Organizer**: Full access
  - ❌ **Event Moderator**: No access
  - ❌ **Participants**: No access
  - ❌ **Public**: No access

### **Form Response Management APIs**

#### 11. **Submit Form Response**
- **Endpoint**: `POST /api/events/{eventId}/forms/{formId}/responses`
- **Description**: Submit a form response (participant registration)
- **Request Body**: `FormSubmissionDTO`
- **Response**: `FormResponseDTO`
- **Access Control**:
  - ❌ **Event Creator/Owner**: No access (unless also participant)
  - ❌ **Event Organizer**: No access (unless also participant)
  - ❌ **Event Moderator**: No access (unless also participant)
  - ✅ **Registered Participants**: Full access
  - ❌ **Public**: No access

#### 12. **Get User's Form Response**
- **Endpoint**: `GET /api/events/{eventId}/forms/{formId}/responses/my`
- **Description**: Get current user's form response
- **Response**: `FormResponseDTO`
- **Access Control**:
  - ❌ **Event Creator/Owner**: No access (unless also participant)
  - ❌ **Event Organizer**: No access (unless also participant)
  - ❌ **Event Moderator**: No access (unless also participant)
  - ✅ **Participants**: Own response only
  - ❌ **Public**: No access

#### 13. **Update Form Response**
- **Endpoint**: `PUT /api/events/{eventId}/forms/{formId}/responses/my`
- **Description**: Update user's form response (if allowed)
- **Request Body**: `FormSubmissionDTO`
- **Response**: `FormResponseDTO`
- **Access Control**:
  - ❌ **Event Creator/Owner**: No access (unless also participant)
  - ❌ **Event Organizer**: No access (unless also participant)
  - ❌ **Event Moderator**: No access (unless also participant)
  - ✅ **Participants**: Own response only (time-limited)
  - ❌ **Public**: No access

#### 14. **Get All Form Responses**
- **Endpoint**: `GET /api/events/{eventId}/forms/{formId}/responses`
- **Description**: Get all responses for a form (admin view)
- **Response**: `PagedResponse<FormResponseDTO>`
- **Query Parameters**: `page`, `size`, `sortBy`, `sortDirection`
- **Access Control**:
  - ✅ **Event Creator/Owner**: Full access with all details
  - ✅ **Event Organizer**: Full access with all details
  - ✅ **Event Moderator**: Limited access (anonymized data)
  - ❌ **Participants**: No access
  - ❌ **Public**: No access

#### 15. **Get Single Form Response**
- **Endpoint**: `GET /api/events/{eventId}/forms/{formId}/responses/{responseId}`
- **Description**: Get details of a specific form response
- **Response**: `FormResponseDTO`
- **Access Control**:
  - ✅ **Event Creator/Owner**: Full access
  - ✅ **Event Organizer**: Full access
  - ✅ **Event Moderator**: Limited access
  - ✅ **Participants**: Own response only
  - ❌ **Public**: No access

#### 16. **Delete Form Response**
- **Endpoint**: `DELETE /api/events/{eventId}/forms/{formId}/responses/{responseId}`
- **Description**: Delete a form response
- **Response**: `204 No Content`
- **Access Control**:
  - ✅ **Event Creator/Owner**: Full access
  - ✅ **Event Organizer**: Full access
  - ❌ **Event Moderator**: No access
  - ✅ **Participants**: Own response only (time-limited)
  - ❌ **Public**: No access

### **Form Analytics APIs**

#### 17. **Get Form Statistics**
- **Endpoint**: `GET /api/events/{eventId}/forms/{formId}/statistics`
- **Description**: Get form response statistics
- **Response**: `FormStatisticsDTO`
- **Access Control**:
  - ✅ **Event Creator/Owner**: Full access
  - ✅ **Event Organizer**: Full access
  - ✅ **Event Moderator**: Basic statistics only
  - ❌ **Participants**: No access
  - ❌ **Public**: No access

#### 18. **Export Form Responses**
- **Endpoint**: `GET /api/events/{eventId}/forms/{formId}/export`
- **Description**: Export form responses to CSV/Excel
- **Query Parameters**: `format=csv|excel`
- **Response**: File download
- **Access Control**:
  - ✅ **Event Creator/Owner**: Full access
  - ✅ **Event Organizer**: Full access
  - ✅ **Event Moderator**: Anonymized export only
  - ❌ **Participants**: No access
  - ❌ **Public**: No access

---

## 🔐 **Role-Based Access Control Details**

### **Role Definitions**

Based on the `EventRoleType` enum (needs to be implemented):

#### 1. **Event Creator/Owner**
- The user who created the event (`Events.createdBy`)
- **Permissions**: Full CRUD access to all form-related operations
- **Restrictions**: None

#### 2. **Event Organizer** 
- Users assigned `EventRoleType.ORGANIZER` role
- **Permissions**: 
  - Full CRUD access to forms and fields
  - View all responses with full details
  - Export data
  - Cannot delete critical forms with existing responses
- **Restrictions**: 
  - Cannot delete the event
  - Cannot change event ownership

#### 3. **Event Moderator**
- Users assigned `EventRoleType.MODERATOR` role  
- **Permissions**:
  - Read-only access to forms
  - Limited field creation (basic fields only)
  - View anonymized response statistics
  - Cannot modify critical form settings
- **Restrictions**:
  - Cannot delete forms or fields
  - Cannot access personally identifiable information
  - Cannot export full data

#### 4. **Registered Participants**
- Users who have registered for the event (`Registration` table)
- **Permissions**:
  - View active forms
  - Submit/update their own responses (time-limited)
  - View their own responses
- **Restrictions**:
  - Cannot access other participants' data
  - Cannot modify forms
  - Update window may be time-limited

#### 5. **Public Users**
- Unauthenticated or non-registered users
- **Permissions**: None for form management
- **Restrictions**: Cannot access any form-related APIs

### **Implementation Requirements**

#### 1. **Role Checking Service**
```java
@Service
public class EventRoleService {
    public boolean hasRole(UUID userId, Long eventId, EventRoleType roleType);
    public boolean isEventCreator(UUID userId, Long eventId);
    public boolean isRegisteredParticipant(UUID userId, Long eventId);
    public List<EventRoleType> getUserRoles(UUID userId, Long eventId);
}
```

#### 2. **Security Annotations**
```java
@PreAuthorize("@eventRoleService.hasRole(authentication.principal.id, #eventId, 'ORGANIZER') or @eventRoleService.isEventCreator(authentication.principal.id, #eventId)")
```

#### 3. **Data Filtering**
- Implement field-level security for sensitive data
- Anonymize responses for moderators
- Apply time-based restrictions for participant updates

#### 4. **Audit Trail**
- Log all form modifications
- Track who accessed what data when
- Maintain change history for compliance

---

## 📊 **Priority Implementation Order**

### **Phase 1 (Critical)**
1. Role-based access control system
2. Update/Delete form APIs
3. Form response submission APIs
4. Basic form field management

### **Phase 2 (Important)**  
5. Form response management for admins
6. Form statistics and analytics
7. Field reordering functionality

### **Phase 3 (Enhancement)**
8. Export functionality
9. Advanced analytics
10. Audit trail and logging

---

## 🔧 **Additional Recommendations**

1. **Validation**: Implement comprehensive request validation
2. **Rate Limiting**: Apply rate limits to prevent abuse
3. **Caching**: Cache form structures for better performance  
4. **Soft Deletes**: Use soft deletes for forms with existing responses
5. **Versioning**: Consider form versioning for historical data
6. **Time Restrictions**: Implement configurable time windows for response updates
7. **Notification System**: Notify relevant users of form changes
8. **Backup/Recovery**: Ensure form data is properly backed up