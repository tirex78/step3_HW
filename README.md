# Учебный Проект на NestJs + TypeORM + TypeScript + PostgreSQL

## Модули
- ### AUTH
  Авторизация происходит посредством JWT токенов

  **access_token** - для получения данных, отправляется с каждым запросом, в токен зашит идентификатор пользователя SUB и роли пользователя TYPE. Срок жизни токена 15 минут.

  **refresh_token** - для обновления access_token. Срок жизни токена 7 дней.
Зашифрованный токен хранится в базе данных.

  Аутентификация - организована посредством ролей хранящихся у пользователя в виде массива, роль по умолчанию **User**

- ### USERS
  Модуль для работы с учетными записями пользователей в котором осуществелны необходимые методы для работы с сущностью. 

- ### PROFILE

  Модуль имеет свой эндпоинт для создания пользователя(регистрация), а так же все необходимые методы для обновления, удаления и получения профиля.

- ### TEXTBLOCK

  Модуль для работы с сущностью TextBlock. Имеет необходимые методы

- ### FILES

  Модуль для работы с файлами. Использует Multer

- ### DATABASE
  Модуль для подключения к базе данных PostgreSQL с использованием TypeORM


## REST Api
  ### Модуль Auth
  - POST - /api/auth/registration - Регистрация пользователя

```json
{
    "login":"New",
    "email":"test@mail2.ru",
    "password":"123456"
}
// return ->
"user": {
        "login": "New",
        "email": "test@mail2.ru",
        "id": 32,
        "roles": [
            "User"
        ],
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMyLCJ0eXBlIjoiVXNlciIsImlhdCI6MTY4MDI1MTk2NywiZXhwIjoxNjgwMjUyODY3fQ.B6n0GnW7kdF3YxeyQzZrx_d5ihd7E1kvHLByNHcbKp8",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMyLCJ0eXBlIjoiVXNlciIsImlhdCI6MTY4MDI1MTk2NywiZXhwIjoxNjgwODU2NzY3fQ.7JXfhbDMLpIsGHE7cLcO_XCxYrNgK015BVXf5osmImM"
    }

```
  - POST - /api/auth/login - Авторизация пользователя
  - POST /api/auth/logout - Выход, удаляет refresh_token из таблицы, что предотвращает генерацию новых токенов
  - GET - /api/auth/refresh - обновляет токены

 ## Модуль User
 ### доступ с ролью ADMIN
  - GET - /api/users - получение всех пользователей с пагинацией
  - GET - /api/users/:id - получение пользователя по его идентификатору
  - PATCH - /api/users/:id - обновляет пользователя по его идентификатору
  - DELETE - /api/users/ - удаляет пользователя по его идентификатору

### доступ с ролью USER
  - GET - /api/users/me - выводит пользователя по идентификатору из токена
  - PATCH - /api/users/me - обновляет пользователя по идентификатору из токена
  - DELETE - /api/users/me - удаляет пользователя по идентификатору из токена

## Модуль PROFILE
  - POST - /auth/signUp - регистрация пользователя, использует модуль AUTH
```json
{
  "login":"New",
  "email":"test@mail1.ru",
  "password":"123456",
  "profile": {
    "firstName":"Kirill",
    "lastName":"First",
    "phone":"6549654"
  }
}
// return ->
"user": {
  "login": "New",
  "email": "test@mail3.ru",
  "id": 35,
  "roles": [
    "User"
  ],
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjM1LCJ0eXBlIjoiVXNlciIsImlhdCI6MTY4MDI1NDM0MywiZXhwIjoxNjgwMjU1MjQzfQ.qapOhJzL9mZ882r4H35Cpov5rMSN0zPEsi-ELaYdu38",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjM1LCJ0eXBlIjoiVXNlciIsImlhdCI6MTY4MDI1NDM0MywiZXhwIjoxNjgwODU5MTQzfQ.Pg3OlrSBmkdsmTSuuVNO06v1JdRdJjyamr_5oc-XZls",
  "profile": {
    "user_id": 35,
    "firstName": "Kirill",
    "lastName": "First",
    "phone": "6549654",
    "id": 18
  }
}
```
### доступ с ролью ADMIN
  - GET - /api/profile - получение всех профайлов с пагинацией
  - GET - /api/profile/:id - получение пользователя по идентификатору
  - PATCH - /api/profile/:id - обновляет данные профайла и учетку пользователя по идентификатору c применениме модуля USERS
  - DELETE - /api/profile/:id - каскадное удаление профайла по идентификатору

### доступ с ролью USER
  - GET - /api/profile/me - выводит пользователя по его идентификатору полученному из токена
  - PATCH - /api/profile/me - обновляет пользователя по его идентификатору
  - DELETE - /api/profile/me - удаляет пользователя по его идентификатору

## Модуль TextBlock
 - GET - /api/textBlock - получение всех сущностей c пагинацией и фильтрацией по query параметрам
 ```json
 // {{URI}}/textBlock?group=main-page&offset=0&limit=1&title=Text2
 // return ->
 {
    "items": [
        {
            "id": 3,
            "title": "Text2",
            "name": "Text page",
            "description": "Description",
            "group": "main-page",
            "createdAt": "2023-03-31T08:34:19.752Z",
            "updatedAt": "2023-03-31T08:34:19.752Z",
            "images": [
              {
                "filename": "5c2bbb7ac9fcc4c0447b8c3f2eb32fb8",
                "path": "uploadedFiles\\file\\5c2bbb7ac9fcc4c0447b8c3f2eb32fb8"
              },
              {
                "filename": "1aa9cad22af1982ff467a7833da5e3e1",
                "path": "uploadedFiles\\file\\1aa9cad22af1982ff467a7833da5e3e1"
              }
            ]
        }
    ],
    "count": 3
}
 ```
 
  - GET - /api/textBlock - получение сущности по Id
 
  - POST - /api/textBlock/add - создание сущности, используется поле получения id изображений. 

      1. пользователь загружает изображения - используется модуль file. 
      2. После заполнения остальной формы и нажатия сохранить, сохраняется сущность с ранее загруженными изображениями)
```json
{
  "title":"Text2",
  "name":"Text page",
  "description":"Description",
  "image":"205,206", // идентификаторы предварительно сохраненных изображений
  "group":"main-page"
}
```
 
  - POST - /api/textBlock - Сущность создается сразу вместе с загрузкой изображений используя form-data. В некоторых случаях превьюшки можно получить на фронте в таком варианте можно воспользоваться данным эндпоинтом.

  - PATCH - /api/textBlock - Обновление сущности
  - DELETE - /api/textBlock - Удаление сущности по ее id, при этом модуль files отвязывает файлы от данной сущности, делая их "не используемыми"
 
## Модуль Files
  - GET - /api/files/:id - получение файла по его id
  - GET - /api/files/essence/:id - получение всех файлов принадлежащих какой либо сущности
  - POST - /api/files/upload - загрузка файлов на сервер через form-data
    1. только загрузка файлов (предварительная загрузка перед сохранением какой либо сущности, например TexBlock)
    2. загрузка файлов для конкретной сущности с указанием essenceId и essenceTable

  - POST - /api/files/unused/:id - обновляет поля принадлежности файла к сущности

  - DELETE - /api/files/remove - удаляет все не используемые файлы
    1. Которые старше одного часа
    2. У которых нет принадлежности к какой либо сущности
```sql
DELETE FROM ${tableName} 
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 hour' 
OR essence_id IS NULL
RETURNING path
```