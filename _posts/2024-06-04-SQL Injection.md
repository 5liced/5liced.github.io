---
title: "SQL Injection"
date: 2024-06-04
categories: [Journal]
tags: [Journal]
---

#### What is a SQL Injection?
Most web applications have a database and allow users to interact with it usually through the search bar or even a login page. In the backend the actual code that is running looks something like this

> _Enter "Cat" in the serach bar_

```sql
SELECT Pet, Price
FROM Animals
WHERE Pet LIKE 'Cat';
```

In this example the user searches for a 'Cat' and the backend runs a SQL query to return all cats and their prices from the Animals database. But what if we were a bit more crafty?

A SQL injection is where you inject your own SQL query into the backend query. This happens when the developer doesn't properly sanitize the input. To abuse this we can do a simple such as:

> _Enter "Cat'; SELECT * FROM MysticalPets; --"_

```sql
SELECT Pet, Price
FROM Animals
WHERE Pet LIKE 'Cat'; SELECT * FROM MysticalPets; --
```

Since in our example the develop didn't sanitize the input and directly inserted our input, we are able to inject our own queries. We do this by ending the first query with a `;` and then we create our own query to be ran. The `--` at the end comments out the rest of the code, in our case there was no other code but sometimes there might be another WHERE clause for example or further authentication checking so we comment it out in order for our query to be valid and ran.