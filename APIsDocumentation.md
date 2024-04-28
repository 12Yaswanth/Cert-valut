### 1. List all certificates:
```
Method: GET
Endpoint: /api/:EmployeeId/certificates
Query Parameters: ?Sort=(ASC/DESC)&OrderBy=(IssueDate/ExpiryDate)

Payload: N/A

Response JSON:
```
## Success:
```
{
    "Certificates": [
        {
            "CertificateId": CertificateId,
            "CertificateName": CertificateName,
            "OrganisationName": OrganisationName,
            "IssueDate": IssueDate,
            "ExpiryDate": ExpiryDate,
            "CertificateUrl": CertificateUrl
        },
        {
            "CertificateId": CertificateId,
            "CertificateName": CertificateName,
            "OrganisationName": OrganisationName,
            "IssueDate": IssueDate,
            "ExpiryDate": ExpiryDate,
            "CertificateUrl": CertificateUrl
        }
    ],
    "ResponseCode": 200
}
```
## Error:
```
{
    "Error": "ErrorMessage",
    "ErrorCode": "ErrorCode"
}
```
**Response code:** 200/400/401/500

### 2. Upload a certificate:
```
Method: POST
Endpoint: /api/:EmployeeId/certificates

Payload:
```
```
{
    "CertificateId": CertificateId,
    "CertificateName": CertificateName,
    "OrganisationName": OrganisationName,
    "IssueDate": IssueDate,
    "ExpiryDate": ExpiryDate,
    "CertificateUrl": CertificateUrl
}
```
**Response JSON:**
## Success:
```
{
    "InsertedCertificate": 
    {
        "CertificateId": CertificateId,
        "CertificateName": CertificateName,
        "OrganisationName": OrganisationName,
        "IssueDate": IssueDate,
        "ExpiryDate": ExpiryDate,
        "CertificateUrl": CertificateUrl
    }
}
```
## Error:
```
{
    "Error": "ErrorMessage",
    "ErrorCode": "ErrorCode"
}
```
**Response code:** 200/400/500

### 3. Edit a certificate:
```
Method: PUT
Endpoint: /api/:EmployeeId/certificates/:CertificateId

Payload:
```
```
{
    "CertificateName": CertificateName,
    "OrganisationName": OrganisationName,
    "IssueDate": IssueDate,
    "ExpiryDate": ExpiryDate,
    "CertificateUrl": CertificateUrl
}
```
**Response JSON:**
## Success:
```
{
    "UpdatedCertificate": 
    {
        "CertificateName": CertificateName,
        "OrganisationName": OrganisationName,
        "IssueDate": IssueDate,
        "ExpiryDate": ExpiryDate,
        "CertificateUrl": CertificateUrl
    }
}
```
## Error:
```
{
    "Error": "ErrorMessage",
    "ErrorCode": "ErrorCode"
}
```
**Response code:** 200/400/401/404/500

### 4. Delete a certificate:
```
Method: DELETE
Endpoint: /api/:EmployeeId/certificates/:CertificateId

Payload: N/A

Response JSON:
```
## Success:
```
{
    "Message": "Certificate deleted successfully."
}
```
## Error:
```
{
    "Error": "ErrorMessage",
    "ErrorCode": "ErrorCode"
}
```
**Response code:** 200/400/404/500

### 5. Search a certificate:
```
Method: GET
Endpoint: /api/:EmployeeId/certificates/search
Query Parameters: (CertificateName/OrganisationName/IssueDate/ExpiryDate)

Payload: N/A

Response JSON:
```
## Success:
```
{

        "Certificates": [
            {
                "CertificateId": CertificateId,
                "CertificateName": CertificateName,
                "OrganisationName": OrganisationName,
                "IssueDate": IssueDate,
                "ExpiryDate": ExpiryDate,
                "CertificateUrl": CertificateUrl
            }
        ]
}
```
## Error:
```
{
    "Error": "ErrorMessage",
    "ErrorCode": "ErrorCode"
}
```
**Response code:** 200/400/401/404/500

## Response Codes:
```
200 (Success): The request was successful.
400 (Bad Request): The request syntax was incorrect or the parameters were invalid.
401 (Unauthorized): Authentication failed.
404 (Not Found): The requested resource was not found.
500 (Internal Server Error): An unexpected server error occurred.
```