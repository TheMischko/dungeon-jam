# Mocks folder

- The content of this folder contains mocked objects and mocking functions for unit tests.

### Mocked objects
- Helps reduce duplicities in unit tests by providing commonly mocked objects.
- As this projects uses `vitest` testing environment, mocking imported dependencies can become tricky.
- The mocked objects are meant to be used in `vi.mock` functions like this:
```ts
import {mockElectron} from "../testing/mocks/mock-electron";

vi.mock('electron', () => mockElectron)
```
- If you identify commonly used mocked import, please include it here in a separate file called `mock-[entity-name].ts`
- There it should be exported as a `const`:
```ts
export const mockElectron = {
  app: {
    on: vi.fn(),
    ...
  },
  ...
}
```

### Mocking functions
- Mocking functions or factory methods help to simplify mocking data objects used as params in tested functions.
- Whenever you encounter a data model which you need to implement first look in this folder to check if there isn't already a mocking function for it.
- You can identify mocking functions by the file starting with the type name in kebab and case ending with `.data.ts`.
- The factory method should be called the same as the data type in a format of `mock[DataType]`.
- This function should one optional partial parameter of the same data type that enables to create mock with custom values.
```ts
export function mockIpcMainEvent(options?: Partial<IpcMainEvent>): IpcMainEvent {
  return {
    ...,
    ...options
  }
}
```
- All members of the mocked data type should be filled with some default value representing most basic form:
  - arrays should be set to empty arrays `[]`
  - string should be populated with uuid `import {v4 as uuid} from 'uuid'; { name: uuid().slice(0, 6)}'`
  - numbers should be set to `Math.ceil(Math.random() * X)` value
  - objects should be `null` or empty objects if the data model allows it
  - date should be `new Date`
  - etc.
