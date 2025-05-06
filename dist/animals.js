import { readAllJsonFilesInDir, writeToJsonFile } from './utils.js';
import { checkAuthentication, getUserIdFromAuthToken } from './authManager.js';
export function JsonIsValidArtwork(jsonObject) {
    // Check for required top-level fields
    const requiredFields = ['name', 'description', 'image'];
    for (const field of requiredFields) {
        if (!(field in jsonObject))
            return [false, { error: `invalid ${field}: must exist` }];
    }
    // name must be a non-empty string
    if (typeof jsonObject.name !== 'string' || jsonObject.name.trim().length < 1) {
        return [false, { error: 'invalid name: must have a length of at least 1' }];
    }
    // image must be a non-empty string
    if (typeof jsonObject.image !== 'string' || jsonObject.image.trim().length < 1) {
        return [false, { error: 'invalid image string: must have a length of at least 1' }];
    }
    // description must be an array with at least 2 items
    if (!Array.isArray(jsonObject.description) || jsonObject.description.length < 2) {
        return [false, { error: 'invalid description: must contain at least 2 items' }];
    }
    return [true, null];
}
export async function addIdAndCreatedByUser(jsonObject, authToken) {
    jsonObject.id = await getNextAvailableInt();
    const userId = getUserIdFromAuthToken(authToken);
    if (userId !== null) {
        jsonObject.createdByUser = userId;
    }
    else {
        throw new Error("User ID could not be retrieved from auth token");
    }
    return jsonObject;
}
async function getNextAvailableInt() {
    const allAnimals = await getAllAnimals();
    const nextAvailableInt = allAnimals.length + 1;
    return nextAvailableInt.toString();
}
export async function createArtwork(authToken, jsonString) {
    const authenticated = checkAuthentication(authToken);
    if (authenticated) {
        let jsonObject;
        try {
            jsonObject = JSON.parse(jsonString);
        }
        catch (error) {
            return [false, { error: 'Invalid JSON string' }];
        }
        const [isValid, error] = JsonIsValidArtwork(jsonObject);
        if (isValid) {
            jsonObject = await addIdAndCreatedByUser(jsonObject, authToken);
            const directory = './data/animals';
            const filePath = `${directory}/${jsonObject.id}.json`;
            writeToJsonFile(filePath, jsonObject);
            return [true, { success: 'Animal created' }];
        }
        else {
            return [false, error];
        }
    }
    else {
        return [false, { error: 'Unauthorized' }];
    }
}
export async function getAllAnimals() {
    const directory = './data/animals';
    return await readAllJsonFilesInDir(directory);
}
export async function getOneAnimal(animalId) {
    const all_animals = await getAllAnimals();
    const animal = all_animals.find(a => a.id === animalId);
    return animal ? [true, animal] : [false, { error: 'Animal not found' }];
}
export async function getAnimalsByUser(userId) {
    const all_animals = await getAllAnimals();
    const animals = all_animals.filter(a => a.createdByUser === userId);
    return animals.length > 0
        ? [true, animals]
        : [false, { error: 'No animals found' }];
}
