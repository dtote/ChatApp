# Deleted User Handling in PQCare

## Problem

When a user is deleted from the application, their messages remain in conversations, but the frontend tries to get user information (profile picture, popup data) and receives 404 errors, generating many console errors.

## Implemented Solution (Simplified)

### 1. **Simple and Efficient Approach**

Instead of storing redundant information in messages, we use a simpler approach:
- **No migration needed**: We don't need to add fields to existing messages
- **No personal data storage**: We don't store profile pictures of deleted users
- **Automatic fallback**: The controller always returns valid data

### 2. **Updated Controllers**

- `getUserInfoWithFallback`: Gets user information with fallback to default data
- `deleteUser`: Deletes user directly without updating messages

### 3. **Improved Frontend**

- Graceful handling of 404 errors
- `DeletedUserIndicator` component to visually show deleted users
- Fallback to default data when user information cannot be obtained

## Implementation

### 1. **Delete a User**

```javascript
// Example of user deletion
const response = await fetch(`/api/users/${userId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 2. **Get User Information with Fallback**

```javascript
// New route that handles deleted users
const response = await fetch(`/api/users/${userId}/info`);
const userData = await response.json();

if (userData.isDeleted) {
  // Deleted user, show visual indicator
  console.log('Deleted user:', userData.username);
}
```

## Benefits

### ✅ **Maintains Conversation Context**
- Messages remain in conversations
- Context of responses is not lost

### ✅ **Reduces Console Errors**
- No more 404 errors when getting user information
- Graceful handling of error cases

### ✅ **Improved User Experience**
- Clear visual indicators for deleted users
- Consistent information throughout the application

### ✅ **Simple and Efficient Solution**
- No data migration required
- No unnecessary personal information storage
- Easy maintenance and debugging

### ✅ **Enhanced Privacy**
- Does not retain profile pictures of deleted users
- Does not store unnecessary personal data
- Complies with data minimization principles

## Privacy Considerations

### 🔒 **Data Preserved**
- Username (for context)
- Messages (for conversation context)

### 🔒 **Data Deleted**
- User email
- Public/private keys
- Sensitive personal information

## Community Handling

### ✅ **Problem Solved**
- Communities use `.populate('members')` which fails with deleted users
- Specific controllers were implemented to handle deleted users in communities

### ✅ **Implemented Solution**
- `community.controllers.js`: Controllers that handle deleted users
- `getUserInfoWithFallback` function: Gets user information with fallback to message data
- Updated `CommunityDetail` component to show deleted users

### ✅ **Features**
- Member list shows deleted users with visual indicators
- Administrator list handles deleted users
- Join/leave communities works normally
- No errors when loading communities with deleted users

## New API Routes

### `GET /api/users/:userId/info`
Gets user information with fallback to message data.

**Response:**
```json
{
  "username": "username or 'Deleted User'",
  "profilePic": "profile_pic_url or default_image",
  "email": "user_email or null",
  "publicKey": "public_key or null",
  "isDeleted": true/false
}
```

### `DELETE /api/users/:userId`
Deletes a user and marks their messages as from a deleted user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

## Troubleshooting

### **Common Errors**

1. **Migration fails**: Check MongoDB connection and permissions
2. **404 errors persist**: Verify that new routes are registered
3. **Components don't render**: Verify that `DeletedUserIndicator` is imported correctly
4. **Error 401 Unauthorized**: Verify that all routes have authentication and frontend sends token

### **Error 401 Unauthorized - Solved**

**Problem**: User and community routes require authentication (`protectRoute`), but frontend wasn't sending the token.

**Implemented solution**:
- ✅ `fetchProfilePic` now sends authorization token
- ✅ `useGetCommunities` now sends authorization token  
- ✅ `CommunityDetail` now sends authorization token
- ✅ All community routes now have `protectRoute`
- ✅ All user routes now have `protectRoute`

### **Error 404 Not Found - Solved**

**Problem**: The `/api/users/:userId/info` endpoint was returning 404 when it couldn't find either the user or a message with `senderInfo`.

**Cause**: Messages from deleted users didn't have the `senderInfo` field because migration hadn't been executed.

**Implemented solution**:
- ✅ **Improved controller**: Now returns default data instead of 404
- ✅ **Improved migration script**: Handles already deleted users
- ✅ **Robust fallback**: Always returns valid information to avoid frontend errors
- ✅ **Consistency**: Both `user.controllers.js` and `community.controllers.js` handle the same case

### **Useful Logs**

```bash
# Check if user exists
db.users.findOne({_id: ObjectId("user_id")})

# Check messages from deleted user
db.messages.find({senderId: ObjectId("user_id")})

# Check if senderInfo field exists
db.messages.findOne({senderInfo: {$exists: true}})
```

## Testing

### **Test Deleted User Display**
1. Delete a user from the database
2. Check that their messages still appear in conversations
3. Verify that profile picture shows default image
4. Confirm that popup shows "Deleted User" with strikethrough

### **Test Community Members**
1. Delete a user who is a member of a community
2. Check that community loads without errors
3. Verify that deleted user appears in member list with indicator
4. Confirm that join/leave functionality works normally

## Future Improvements

### **Potential Enhancements**
- Add timestamp of when user was deleted
- Store reason for deletion (if applicable)
- Add admin interface to manage deleted users
- Implement message anonymization options

### **Performance Optimizations**
- Cache deleted user information
- Batch process multiple user deletions
- Optimize database queries for large datasets 