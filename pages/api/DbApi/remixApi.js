import axios from "axios"
import { ApiUrl } from "../../api/DbApi/apiUrl"

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

export const UpdateMcqContent = async(wikiText, mcqType, mcqData) => {
    try {
        const response = await axios.put(
            `${ApiUrl}wiki/remix/mcq_content/`,
            {
                wikipedia_url: `https://en.wikipedia.org/wiki/${wikiText}`,
                mcq_type: mcqType,
                mcq_content: mcqData
            }
        )
        return response
    } catch(err) {
        return err.response
    }
}