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


export const UpdateMcqContent = async(wikiText, mcqType, mcqData) => {
    let sendObject = {}
    if(mcqType === "Summary"){
        sendObject = {
            summary: mcqData
        }
    }
    if(mcqType === "Code"){
        sendObject = {
            code: mcqData
        }
    }
    if(mcqType === "Simulater Viewer"){
        sendObject = {
            simulator: mcqData
        }
    }
    try {
        const response = await axios.put(
            `${ApiUrl}wiki/remix/mcq_content/`,
            {
                wikipedia_url: `https://en.wikipedia.org/wiki/${wikiText}`,
                mcq_content :sendObject,
               
            }
        )
        return response
    } catch(err) {
        return err.response
    }
}