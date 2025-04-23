import axios from "axios"
import { ApiUrl } from "./apiUrl"

export const WikiDataFromDb = async(wikiText) => {
    try {
      const response = await axios.get(`${ApiUrl}wikipedia/${wikiText}/`);
      return response;
    } catch(err) {
      return err.response || {
        status: 500,
        data: { error: "Network error or server unavailable" }
      };
    }
}

export const SaveDataToDb = async(
    wikipedia_url,
    summary,
    mcqData,
    mermaid_Code,
    p5_code,
    three_Code,
    d3_code,
<<<<<<< HEAD
    remix1 = null,
    remix2 = null,
    remix3 = null,
    mcqContent = null
) => {
=======

  ) => {
>>>>>>> 82b81eb3f46b3dfcc52165814c475a5e4799be98
    try {
      const response = await axios.post(`${ApiUrl}wiki/save/`, {
        wikipedia_url,
        summary,
        mcq: mcqData,
        mermaid_Code,
        p5_code,
        three_Code,
        d3_code,
<<<<<<< HEAD
        remix1,
        remix2,
        remix3,
        mcq_content: mcqContent
=======
>>>>>>> 82b81eb3f46b3dfcc52165814c475a5e4799be98
      });
      return response;
    } catch(err) {
      return err.response;
    }
}