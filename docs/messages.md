# Messages

Message is an [json](https://en.wikipedia.org/wiki/JSON) object that is send between all elements of this project. This project assumes that string fields in json objects can contain newline characters marked as `\n`.

> Example json objects may contain comments (text after `//`), although it is important **not** to use comments when communicating as it is not part of the standard.
## Overview of how transmitted message looks in general
```javascript
{
	// Always required
	"type": "request or response or info", 
	"program": "program name",
	// Not always required
	"id": 234, // Currently timestamp
	// Alway required
	"msg": { // This needs to be an object
		"Field1" : 123,
		"Field2" : "Some info"
	}
}
```
## Types of messages
There are three types of messages. The type is specified via `type` field.
1. Response - Response message to the request message that program has received.
2. Request - Request to the program from client.
3. Info - Some kind of information transmitted from program to all clients.
