import axios from "axios"
import { ApiUrl } from "../DbApi/apiUrl"

export const UpdateRemixVersion = async(wikiText, remixField, remixData) => {
    try {
        const response = await axios.put(
            `${ApiUrl}wiki/remix/${remixField}/`,
            {
                wikipedia_url: `https://en.wikipedia.org/wiki/${wikiText}`,
                [remixField]: remixData
            }
        )
        return response
    } catch(err) {
        return err.response
    }
}