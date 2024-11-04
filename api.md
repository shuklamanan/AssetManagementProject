## 1) Signup Page

### `URL: POST /api/signup/`

### Request Body:
```
{
    "username":"MananShukla",
    "first_name":"Manan",
    "last_name":"Shukla",
    "role":"admin",
    "email":"manan.shukla@noovosoft.com",
    "password":"98989898",
    "phone_number": 9999999999,
    "department":"Backend",
    "date_of_birth": "11-11-1111"
}   
```

### Response:

### i) Everything is Okay

```
HTTP/1.1 200 OK
{
    "message":"User Created Successfully",
}
```

### ii) Server Fail,

```
HTTP/1.1 500 Internal Server Error
    
{
   "message":"Internal Server Error"
}
```

## 2) SignIn

### `URL: POST /api/signin/`

### Request Body:

```
{ 
   "username":"username",
   "password":"password"
}
```

### Response:

### i) If credentials right,

```
    HTTP/1.1 200 OK
{
    "message":"Successful SignIn",
    "token":"Jwt Token",
    "username":"MananShukla",
    "first_name":"Manan",
    "last_name":"Shukla",
    "role":"admin",
    "email":"manan.shukla@noovosoft.com",
    "phone_number": 9999999999,
    "department":"Backend",
    "date_of_birth": "11-11-1111"
}
```


### ii) If credentials wrong,

```
HTTP/1.1 400 Bad request    
{
   "message":"Incorrect Username or Password"
}
```

### iii) Server Fail,

```
HTTP/1.1 500 Internal Server Error
    
{
   "message":"Internal Server Error"
}
```

## 3) Dashboard Page

### `URL: GET /api/asset/`

### Request Header:

```
{
    "authentication":"Jwt Token"
}
```

### Response:

### i) If user is Admin

```
    HTTP/1.1 200 OK
    [ 
        {
            "id":"1",
            "name":"Lenovo Thinkpad",
            "user_id":"1",
            "user_name":"Manan",
            "asset_type":"Hardware",
            "config":"{
                        "size":"14 inch",
                        "RAM":"16 GB"
                      }",
            "assigned_by":"Parth",
            "assigned_at":"01:30:00 1/8/2024",
            "unassigned_at":"null"
        },
        {
            "id":"2",
            "name":"Lenovo Thinkpad",
            "user_id":"2",
            "user_name":"Utsav",
            "asset_type":"Hardware",
            "config":"{
                        "size":"14 inch",
                        "RAM":"16 GB"
                      }",
            "assigned_by":"Parth",
            "assigned_at":"01:30:00 1/8/2024",
            "unassigned_at":"null"
        }, ...
    ]
```

### ii) If user is not an Admin

```
    HTTP/1.1 200 OK
    [ 
        {
            "id":"1",
            "name":"Lenovo Thinkpad",
            "userId":"1",
            "user_name":"Manan",
            "asset_type":"Hardware",
            "config":"{
                        "size":"14 inch",
                        "RAM":"16 GB"
                      }",
            "assigned_by":"Parth",
            "assigned_at":"01:30:00 1/8/2024",
            "unassigned_at":"null"
        }, ... 
    ]
```

### iii) Server Fail,

```
HTTP/1.1 500 Internal Server Error
{
    "message":"Internal Server Error"
}
```

## 4) Users Page (For Admin Only)

### `URL: GET /api/users/`

### Request Header:

```
{
    "authentication":"Jwt Token"
}
```

### Response:

### i) Successfully get users data

```
    HTTP/1.1 200 OK
    [ 
        {
            "id":"1",
            "username":"MananShukla"
            "first_name":"Manan",
            "last_name":"Shukla",
            "role":"Employee",
            "email":"manan.shukla@noovosoft.com",
            "phone_number": 9999999999,
            "department":"Backend"
        }, ... 
    ]
```

### ii) Server Fail,

```
    HTTP/1.1 500 Internal Server Error
    
    {
        "message":"Internal Server Error"
    }
```

## 5) Profile Page

### `URL: GET /api/profile/`

### Request Header:

```
{
    "authentication":"Jwt Token"
}
```

### Response:

### i) successfully get data

```
{
    "username":"MananShukla",
    "first_name":"Manan",
    "last_name":"Shukla",
    "role":"admin",
    "email":"manan.shukla@noovosoft.com",
    "phone_number": 9999999999,
    "department":"Backend",
    "date_of_birth": "11-11-1111",
}
```

### ii) Server Fail,

```
    HTTP/1.1 500 Internal Server Error
    
    {
        "message":"Internal Server Error"
    }
```

## 6) Add User (For Admin Only)

### `URL: POST /api/user/`

### Request Header:

```
{
    "authentication":"Jwt Token"
}
```

### Request Body:

```
{
    "username":"UtsavMehta",
    "first_name":"Utsav",
    "last_name":"Mehta",
    "role":"employee",
    "email":"utsav.mehta@noovosoft.com",
    "password":"RandomPassword123",
    "phone_number": 9999999997,
    "department":"Backend",
    "date_of_birth": "11-11-1111",
}
```
### Response:

### i) Successfully registered

```
    HTTP/1.1 202 User Created
    
    {
        "message":"User Registered Successfully",
    }
```

### ii) Server Fail,

```
    HTTP/1.1 500 Internal Server Error
    
    {
        "message":"Internal Server Error"
    }
```


## 7) Add Asset (For Admin Only)

### `URL: POST /api/asset/`

### Request Header:

```
{
    "authentication":"Jwt Token"
}
```

### Request Body:

```
{
    "name":"Lenovo Thinkpad",
    "asset_type":"Hardware",
    "user_id":1, 
    "config":"{
                "size":"14 inch",
                "RAM":"16 GB"
    }"
}

(userId is not necessary)
```
### Response:

### i) successfully Add asset

```
    HTTP/1.1 202 Created
    
    {
        "message":"Asset Registered Successfully",
    }
```

### ii) Server Fail,

```
    HTTP/1.1 500 Internal Server Error
    
    {
        "message":"Internal Server Error"
    }
```

## 8) Update User details

### `URL: PUT /api/user/:id`

### Request Header:

```
{
    "authentication":"Jwt Token"
}
```

### Request Body:

```
{
    "username":"UtsavMehta",
    "first_name":"Utsav",
    "last_name":"Mehta",
    "role":"employee",
    "email":"utsav.mehta@noovosoft.com",
    "password":"RandomPassword123",
    "phone_number": 9999999996,
    "department":"Backend",
    "date_of_birth": "11-11-1111",
}
```
### Response:

### i) user detail updated

```
    HTTP/1.1 200 Ok
    
    {
        "message":"User Updated Successfully",
    }
```

### ii) User not found

```
    HTTP/1.1 404 not Found
    
    {
        "message":"UserId is not present",
    }
```

### iii) Server Fail,

```
    HTTP/1.1 500 Internal Server Error
    
    {
        "message":"Internal Server Error"
    }
```

## 9) Update Asset details (For Admin Only)

### `URL: PUT /api/asset/:id`

### Request Header:

```
{
    "authentication":"Jwt Token"
}
```

### Request Body:

```
{
    "name":"Lenovo Thinkpad",
    "asset_type":"Hardware",
    "username":"MananShukla",
    "config":"{
                "size":"14 inch",
                "RAM":"16 GB"
    }"
}
```
### Response:

### i) asset detail updated

```
    HTTP/1.1 200 Ok
    
    {
        "message":"Asset Updated Successfully",
    }
```

### ii) asset not found

```
    HTTP/1.1 404 not Found
    
    {
        "message":"assetId is not present",
    }
```

### iii) user not found

```
    HTTP/1.1 404 not Found
    
    {
        "message":"username is not present",
    }
```

### iv) Server Fail,

```
    HTTP/1.1 500 Internal Server Error
    
    {
        "message":"Internal Server Error"
    }
```

## 10) Delete User (For Admin Only)

### `URL: DELETE /api/user/:id`

### Request Header:

```
{
    "authentication":"Jwt Token"
}
```

### Response:

### i) If user found

```
    HTTP/1.1 200 Ok
    
    {
        "message":"User Deleted Successfully",
    }
```

### ii) If user is not found in DB

```
    HTTP/1.1 404 not Found
    
    {
        "message":"User is not present",
    }
```

### iii) Server Fail,

```
    HTTP/1.1 500 Internal Server Error
    
    {
        "message":"Internal Server Error"
    }
```

## 11) Delete Asset (For Admin Only)

### `URL: DELETE /api/asset/:id`

### Request Header:

```
{
    "authentication":"Jwt Token"
}
```

### Response:

### i) If asset found

```
    HTTP/1.1 200 Ok
    
    {
        "message":"Asset Deleted Successfully",
    }
```

### ii) If asset is not found in DB

```
    HTTP/1.1 404 not Found
    
    {
        "message":"Asset is not present",
    }
```

### iii) Server Fail

```
    HTTP/1.1 500 Internal Server Error
    
    {
        "message":"Internal Server Error"
    }
```

## 12) OTP Verify

### `URL: GET /api/verify/`

### Request Body:

```
{
    "mail":"manan.shukla@noovosoft.com"
    "otp":"999999"
}
```

### Response: 

### i) If OTP is right

```
HTTP/1.1 200 OK
{
    "message":"User is successfully verified"
}
```

### ii) If OTP is not right

```
HTTP/1.1 400 Bad Request
{
    "message":"OTP IS incorrect"
}
```

### iii) Server Fail

```
HTTP/1.1 500 Internal Server Error    
{
    "message":"Internal Server Error"
}
```