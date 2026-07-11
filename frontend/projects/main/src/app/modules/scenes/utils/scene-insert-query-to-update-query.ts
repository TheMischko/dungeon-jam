import {
  Scene,
  SceneInsertQuery,
  SceneUpdateQuery,
} from '@shared/models/scene.model';

export const sceneInsertQueryToUpdateQuery = (
  insertQuery: SceneInsertQuery,
  sceneToUpdate: Scene
): SceneUpdateQuery => {
  const updateQuery: SceneUpdateQuery = {
    id: sceneToUpdate.id,
  };

  if (sceneToUpdate.name !== insertQuery.name) {
    updateQuery.name = insertQuery.name;
  }

  if (sceneToUpdate.description !== insertQuery.description) {
    updateQuery.description = insertQuery.description ?? null;
  }

  if (sceneToUpdate.imageUrl !== insertQuery.imageUrl) {
    updateQuery.imageUrl = insertQuery.imageUrl;
  }

  if (
    sceneToUpdate.tags.some((t) => !insertQuery.tags.includes(t)) ||
    insertQuery.tags.some((t) => !sceneToUpdate.tags.includes(t))
  ) {
    updateQuery.tagsRemoved = sceneToUpdate.tags.filter(
      (tagId) => !insertQuery.tags.includes(tagId)
    );
    updateQuery.tagsAdded = insertQuery.tags.filter(
      (tagId) => !sceneToUpdate.tags.includes(tagId)
    );
  }

  if (sceneToUpdate.playlistId !== insertQuery.playlistId) {
    updateQuery.playlistId = insertQuery.playlistId ?? null;
  }

  return updateQuery;
};
