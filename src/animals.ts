
import { readAllJsonFilesInDir, writeToJsonFile } from './utils.js'
import { checkAuthentication, getUserIdFromAuthToken } from './authManager.js'
import { randomUUID } from 'crypto'
import { Artwork } from './interfaces.js'

export function JsonIsValidArtwork(jsonObject: Artwork): [boolean, null | { error: string } ] {
    // Check for required top-level fields
    const requiredFields = ['name', 'description', 'image']
    for (const field of requiredFields) {
      if (!(field in jsonObject)) return [false, { error: `invalid ${field}: must exist`}]
    }
  
    // name must be a non-empty string
    if (typeof jsonObject.name !== 'string' || jsonObject.name.trim().length < 1) {
      return [false, { error: 'invalid name: must have a length of at least 1'}]
    }

    // image must be a non-empty string
    if (typeof jsonObject.image !== 'string' || jsonObject.image.trim().length < 1) {
      return [false, { error: 'invalid image string: must have a length of at least 1'}]
    }
  
    // description must be an array with at least 2 items
    if (!Array.isArray(jsonObject.description) || jsonObject.description.length < 2) {
      return [false, { error: 'invalid description: must contain at least 2 items'}]
    }
  
    return [true, null]
  }
  
  
  export async function addIdAndCreatedByUser(jsonObject: Artwork , authToken: string): Promise<Artwork> {
  
    jsonObject.id = await getNextAvailableInt()
    
    const userId: string | null = getUserIdFromAuthToken(authToken);

    if (userId !== null) {
        jsonObject.createdByUser = userId
    } else {
        throw new Error("User ID could not be retrieved from auth token")
    }
    
    return jsonObject
  
  }

  async function getNextAvailableInt(): Promise<string> {

    const allAnimals: Artwork[] =  await getAllAnimals()
    const nextAvailableInt: number = allAnimals.length + 1
    return nextAvailableInt.toString()

  }
  
  export async function createArtwork(authToken: string, jsonString: string): Promise<[boolean, { error: string } | { success: string } | null ]> {
  
    const authenticated: boolean = checkAuthentication(authToken)
  
    if (authenticated) {
      
      let jsonObject: Artwork

      try {
        jsonObject = JSON.parse(jsonString);
      } catch (error) {
        return [false, { error: 'Invalid JSON string' }]
      }

      const [isValid, error]: [boolean, null | { error: string } ] = JsonIsValidArtwork(jsonObject)
  
      if (isValid) {
  
        jsonObject = await addIdAndCreatedByUser(jsonObject, authToken)
  
        const directory: string = './data/animals'
        const filePath: string = `${directory}/${jsonObject.id}.json`
    
        writeToJsonFile(filePath, jsonObject)
        return [true, { success: 'Animal created' }]
  
  
      } else {
        
        return [false, error]

  
      }
  
    } else {

      return [false, { error: 'Unauthorized' }]

    }
  
  
  }
  
  export async function getAllAnimals(): Promise<Artwork[]> {
  
    const directory: string = './data/animals'
    return await readAllJsonFilesInDir<Artwork>(directory) 
  
  }
  
  export async function getOneAnimal(animalId: string): Promise<[boolean, Artwork | { error: string }]>  {
  
    const all_animals: Artwork[] = await getAllAnimals()
    const animal: Artwork | undefined = all_animals.find(a => a.id === animalId)
    return animal ? [true, animal] : [false, { error: 'Animal not found' }] 

  }

  export async function getAnimalsByUser(userId: string): Promise<[boolean, Artwork[] | { error: string }]> {

    const all_animals = await getAllAnimals()
    const animals = all_animals.filter(a => a.createdByUser === userId)
    
    return animals.length > 0
      ? [true, animals]
      : [false, { error: 'No animals found' }]

  }
  