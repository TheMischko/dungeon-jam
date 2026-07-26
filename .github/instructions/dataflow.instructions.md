---
applyTo: "**/*.ts"
---
# Dataflow Instructions
This instruction files covers a common scenario of creating Electron Backend <-> Angular Frontend communication.

## 1. Data storage
Everything starts in database. At the moment we are using JSON type database, with custom wrappers, that should allow us to switch the implementation if we need to.
The Data Models for the database entities are stored in `/shared/models/` folder. 

Each database entity needs to have a database initialization function. Those are found in `/src/main/database/init-database.ts`.  Usually we want to provide there an empty array of correct type.

Now the database "table" is prepared.

## 2. Communication channels
To allow the Angular Frontend to access the data, we need to define communication channels. Those are defined as string enums in `/shared/models/channels.models.ts`. Each entity has its own list of channels, which usually include the CRUD operations and some special operations specific to the entity.
Make sure there is a new Channel enum for each group of related operations, e.g. for the entity.

The string values of the channel enum serves as pseudo-paths for the IPC communication. They need to be unique. Usually it has a form of `entity/operation-name`, e.g. `playlists/get-all`.

This is an example of the channel enum for the Playlist entity:
```typescript
export enum PlaylistChannel {
    GET_ALL = 'playlists/get-all',
    GET_BY_ID = 'playlists/get',
    INSERT = 'playlists/insert',
    ADD_TRACKS = 'playlists/add-tracks',
    UPDATE = 'playlists/update',
}
```

## 3. Data Access
To access the data, we need to create an Entity **Manager**. This is a singleton class, which provides methods for entity data retrieval and manipulation. It also registers listeners for Electron IPC events, so Angular Frontend can call and use those methods.
The Managers are stored in `/src/main/managers/` folder.

The Manager class uses following template:
```typescript
// Change "Entity" to correct name of the entity, e.g. "Tags"
export class EntityManager {
    private static _instance: EntityManager;

    // Add any dependencies here, e.g. other managers, services, etc.
    private constructor(private entityDatabase: DatabaseProvider<Entity>) {
    }

    public static async getInstance(): Promise<EntityManager> {
        if (!EntityManager._instance) {
            // Prepare all the dependencies here and pass it to the constructor.
            const database = await EntityManager.prepareDatabase();
            TagsManager._instance = new EntityManager(database);
            TagsManager._instance.registerChannels();
        }
        return TagsManager._instance;
    }

    // This is where you implement the logic for handling the IPC requests. Generally the handlers are defined as public methods, so other services can access the Manager functionality.
    private registerChannels(): void {
        // Each entity has its own list of channels, in form of string enums defined in /shared/models/channels.models.ts. Usually there are the CRUD operations and some special operations specific to the entity.
        ipcMain.handle(ChannelEnum.Channel, async (_, request?: RequestType) => {
            return await this.handleChannelRequest(query);
        });
    }
    
}
```

### 3a. Database Access
The managers in general are using `DatabaseProvider<Entity>` as a dependency, as it is the wrapper and the main data accessor for the database data.

The `DatabaseProvider` needs to be initialized with the Builder object `DatabaseProviderCreator`. This builder allows us to setup the correct table name, the ID column, custom sorting and filtering functions, etc.
Example of such initialization:
```typescript
    private static async prepareDatabase(): Promise<DatabaseProvider<TagData>> {
        return await DatabaseProviderCreator.create<TagData>()
          .setTable('tags')
          .setIdColumn('id')
          .setSort(TagsManager.sortTags.bind(this))
          .setFilter(TagsManager.filterTags.bind(this))
          .complete();
      }
```

### 3b. Manager initialization
The managers are not prepared on demand, but the developer needs to explicitly register the creation of the manager. That is done in the `src/main/configs/managers.config.ts` file. There is a function `getManagersInitConfig`, which returns and ordered array of initialization configs defined by manager name and the `initFunction`.
Each new manager needs to be added to this array, so it can be properly initialized on app startup. Generally new managers are added at the end of the array, but if there are dependencies between managers, the order needs to be adjusted accordingly.
Example of such registration:
```typescript
 const viewConfig = getDefaultViewConfig(buildPath);
  return [
    {
      name: 'View',
      initFunction: async () => {
        await ViewManager.getInstance(viewConfig);
      },
    },
    //... other manager initialization configs
  ]
```

## 4. IPC Communication
After the channels are prepared and the listeners are registered, Frontend global API needs to be updated to provide functions to call and trigger the IPC events.
That is being done by adding new functions to preload files, which are provided to the Angular Frontend as a global API. The preload files are stored in `/src/preload/` folder. Each entity has its own file, which provides functions for all the operations related to that entity.
There are exported files, which generally just call the `ipcRenderer.invoke` with correct data and channel, and defines correct return type of such action.
Example of such function:
```typescript
const getAllPlaylists = async (options: QueryRequest): Promise<Playlist[]> => {
    return await ipcRenderer.invoke(PlaylistChannel.GET_ALL, options);
};
```

### 4a. Frontend API providers
As the preload functions are available on the `Window` object, we need to provide type override for a window with the preload functionality on Frontend.
This is done by exported files in `frontend/projects/general/models/api` files. Each entity or group of operations has its own file with its own type. The type is called `EntityApiWindow` and combines vanilla `Window` type and the functions from preload (those need to match one-by-one).
Example of such type:
```typescript
export type PlaylistApiWindow = Window &
    typeof globalThis & {
    PLAYLIST_API: {
        getAllPlaylists: (options: QueryRequest) => Promise<Playlist[]>;
        getPlaylistById: (playlistId: string) => Promise<Playlist>;
        insertPlaylist: (data: PlaylistInsertQuery) => Promise<Playlist>;
        addTracksToPlaylists: (
            data: PlaylistAddTracksData,
        ) => Promise<Map<string, Playlist>>;
        updatePlaylist: (query: PlaylistUpdateQuery) => Promise<Playlist>;
    };
};
```

## 5. Frontend Angular Services and management
After the preload functions are accessible on the Frontend, we can create Angular Services, which will call those functions and provide data to the Angular components or stores. The services lives either on project level, or if the entity is throughout the app, it can be created in the `general` project (`frontend/projects/general/src/lib/services`).
The services are common Angular services, which bundle the async nature of the IPC communication in the Observables from `rxjs`.
An example of a service function to call and IPC endpoint might look like this:
```typescript
export class PlaylistApiService {
    private readonly window = <PlaylistApiWindow>window;

    getAllPlaylists(options: QueryRequest): Observable<Playlist[]> {
        const subject = new Subject<Playlist[]>();
        this.window.PLAYLIST_API.getAllPlaylists(options)
            .then((playlists) => {
                subject.next(playlists);
                subject.complete();
            })
            .catch((error) => {
                subject.error(error);
            });
        return subject.asObservable();
    }
}
```

# Conclusion
This file describes the general flow of data from the database to the Angular Frontend, and how to set up the communication channels and services to allow that. It is a common scenario for many entities in the app, so following this template should help to maintain consistency and structure in the codebase.