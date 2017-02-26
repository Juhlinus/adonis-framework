# Broken
## Event.wildcard
*[ts] Property 'wildcard' does not exist on type 'EventEmitter2'.*

EventEmitter2Configuration has that property though.
## Event.removeListener
*[ts] Argument of type 'string' is not assignable to parameter of type 'Function'.*

It requires the **parameter** listener to be a **function**.
```typescript
/**
* Remove a listener from the listener array for the specified event.
* Caution: changes array indices in the listener array behind the listener.
* @param event
* @param listener
*/
removeListener(event: string, listener: Function): EventEmitter2;
```
Might be able to use **removeAllListeners** method instead.
```typescript
/**
* Removes all listeners, or those of the specified event.
* @param event
*/
removeAllListeners(event?: string): EventEmitter2;
```