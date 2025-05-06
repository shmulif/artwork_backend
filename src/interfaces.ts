import * as jwt from 'jsonwebtoken'
import { JwtPayload } from 'jsonwebtoken'

export interface UserPayload extends JwtPayload {
  id: string;
}

export interface User {
    id: string
    hash: string
    name: string
    animals: NameAndID[]
  }

  export interface AnimalEvent {
    name: string
    date: string
    url: string
  }
  
  export interface Artwork {
    id: string
    name: string
    image: string
    description: string[]
    createdByUser: string
  }

  export interface JsonObject { 
    [key: string]: any 
  }

  export interface NameAndID {
    name: string;
    id: string;
}