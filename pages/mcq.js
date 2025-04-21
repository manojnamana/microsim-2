import { ArrowBackIosNew, ArrowBackOutlined } from '@mui/icons-material';
import { Box, Button, Card, Stack, Typography, Radio, RadioGroup, FormControlLabel, FormControl, Alert, Chip, IconButton } from '@mui/material'
import { useRouter } from 'next/router';
import React, { useState } from 'react'

// const mcqOptions = [
//     {
//         "question": "What is the primary process that the interactive visualization demonstrates?",
//         "options": [
//             "Water cycle",
//             "Carbon cycle",
//             "Nitrogen cycle",
//             "Rock cycle"
//         ],
//         "correctAnswer": 0,
//         "explanation": "The visualization specifically demonstrates the water cycle, which circulates water throughout Earth.",
//         "bloomsLevel": "Knowledge",
//         "relatedLearningObjective": "Identify the fundamental Earth process depicted in the visualization"
//     },
//     {
//         "question": "How does the water cycle circulate water throughout Earth?",
//         "options": [
//             "By keeping water in one static location",
//             "Through a series of phase changes and water transport processes",
//             "By converting water into other substances",
//             "Through photosynthesis in plants"
//         ],
//         "correctAnswer": 1,
//         "explanation": "The water cycle involves water changing phases (evaporation, condensation) and being transported around Earth through processes like precipitation, infiltration, and surface runoff.",
//         "bloomsLevel": "Comprehension",
//         "relatedLearningObjective": "Summarize how water is circulated throughout Earth by the water cycle"
//     },
//     {
//         "question": "Based on the visualization, what would likely happen to water that falls as precipitation over land?",
//         "options": [
//             "It would all evaporate back into the atmosphere immediately",
//             "It would be permanently stored in ice caps and glaciers",
//             "Some could infiltrate into the ground or flow over the surface",
//             "It would be converted into carbon dioxide"
//         ],
//         "correctAnswer": 2,
//         "explanation": "When precipitation falls over land, some water infiltrates into the ground to be stored as groundwater, while some flows over the land surface as runoff into bodies of water. Some also evaporates back into the atmosphere.",
//         "bloomsLevel": "Application",
//         "relatedLearningObjective": "Analyze how water can take different pathways through Earth's systems after precipitating over land"
//     },
//     {
//         "question": "If the visualization showed that evaporation was greatly reduced, what effect would this likely have on the water cycle?",
//         "options": [
//             "There would be more precipitation",
//             "The water cycle would shut down completely",
//             "There would be less water vapor in the atmosphere",
//             "Surface water would all soak into groundwater"
//         ],
//         "correctAnswer": 2,
//         "explanation": "With reduced evaporation, less water would be converted to water vapor and enter the atmosphere. This would decrease atmospheric moisture and likely reduce cloud formation and precipitation.",
//         "bloomsLevel": "Analysis",
//         "relatedLearningObjective": "Predict how changes to one part of the water cycle may impact other components of the cycle"
//     },
//     {
//         "question": "Why is a visualization an effective tool for learning about the water cycle?",
//         "options": [
//             "It allows the learner to passively watch the process",
//             "It focuses solely on mathematical equations",
//             "It can dynamically show interconnected processes and pathways",
//             "It is not useful since the water cycle is too simple"
//         ],
//         "correctAnswer": 2,
//         "explanation": "An interactive visualization is valuable for learning about the water cycle because it can dynamically depict the interconnected processes and pathways in a way that static images or text alone cannot. Learners can see how water moves and changes throughout the cycle.",
//         "bloomsLevel": "Evaluation",
//         "relatedLearningObjective": "Evaluate the benefits of using an interactive visualization to learn about the water cycle"
//     }
// ]

const Mcq = ({mcqOptions,mcqType}) => {
  const [selectedAnswers, setSelectedAnswers] = useState(Array(mcqOptions?.length).fill(null));
  const [showAnswers, setShowAnswers] = useState(false);
  const [score, setScore] = useState(0);
  const router = useRouter();
  const handleOptionSelect = (questionIndex, optionIndex) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleSubmit = () => {
    let newScore = 0;
    mcqOptions.forEach((mcq, index) => {
      if (selectedAnswers[index] === mcq.correctAnswer) {
        newScore++;
      }
    });
    setScore(newScore);
    setShowAnswers(true);
  };

  const calculatePercentage = () => {
    return ((score / mcqOptions.length) * 100).toFixed(1);
  };

  const getAnswerStatus = (questionIndex) => {
    if (!showAnswers) return null;
    const isCorrect = selectedAnswers[questionIndex] === mcqOptions[questionIndex].correctAnswer;
    return {
      status: isCorrect ? "Correct" : "Incorrect",
      color: isCorrect ? "success" : "error"
    };
  };

  if(!mcqOptions){
    return (
    <Stack justifyContent={"center"} alignItems={"center"} height={"100vh"}>
      <Box sx={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
        <Typography variant="h4" textAlign={"center"} gutterBottom sx={{ mb: 4 }}>No data found</Typography>
        {/* <Button onClick={() => router.back()} variant="contained" color="primary">
          <ArrowBackOutlined sx={{mr:1,color:"white"}}/>
          Go Back</Button> */}
      </Box>
 
    </Stack>
  )
  }

  return (

   
    <Card elevation={2} sx={{  p: 2, m:2, }}>
    {/* <Box>
      <IconButton onClick={() => router.back()} variant='outlined'  sx={{position:"absolute",top:10,left:10,bgcolor:"whitesmoke"}}>
        <ArrowBackIosNew color='primary' /></IconButton>
    </Box> */}
      <Typography variant="h6"  gutterBottom sx={{ mb: 4 }}>
        Multiple Choice Questions {mcqType}
      </Typography>
      
      <Stack spacing={3}>
        {mcqOptions?.map((mcq, index) => {
          const answerStatus = getAnswerStatus(index);
          return (
            <Card key={index} elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {index + 1}. {mcq.question}
                </Typography>
                {answerStatus && (
                  <Chip 
                    label={answerStatus.status}
                    color={answerStatus.color}
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>
            
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={selectedAnswers[index] !== null ? selectedAnswers[index] : ''}
                  onChange={(e) => handleOptionSelect(index, parseInt(e.target.value))}
                >
                  {mcq?.options.map((option, optIndex) => {
                    const isCorrectAnswer = showAnswers && optIndex === mcq.correctAnswer;
                    const isSelectedAnswer = showAnswers && optIndex === selectedAnswers[index];
                    
                    return (
                      <FormControlLabel
                        key={optIndex}
                        value={optIndex}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{option}</Typography>
                            {showAnswers && (
                              <>
                                {isCorrectAnswer && (
                                  <Chip 
                                    label="Correct Answer" 
                                    color="success" 
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                                {isSelectedAnswer && !isCorrectAnswer && (
                                  <Chip 
                                    label="Your Answer" 
                                    color="error" 
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </>
                            )}
                          </Box>
                        }
                        disabled={showAnswers}
                        sx={{
                          color: showAnswers
                            ? optIndex === mcq.correctAnswer
                              ? 'success.main'
                              : selectedAnswers[index] === optIndex
                              ? 'error.main'
                              : 'text.primary'
                            : 'text.primary',
                          '& .MuiFormControlLabel-label': {
                            width: '100%'
                          }
                        }}
                      />
                    );
                  })}
                </RadioGroup>
              </FormControl>

              {showAnswers && (
                <Alert 
                  severity={selectedAnswers[index] === mcq.correctAnswer ? "success" : "error"}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {selectedAnswers[index] === mcq.correctAnswer ? "Correct!" : "Incorrect"}
                  </Typography>
                  {mcq.explanation}
                </Alert>
              )}
            </Card>
          );
        })}
      </Stack>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'end', gap: 2 }}>
        {!showAnswers ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={selectedAnswers.includes(null)}
          >
            Submit Answers
          </Button>
        ) : (
          // <Box sx={{ textAlign: 'center' }}>
          //   <Typography variant="h5" gutterBottom>
          //     Your Score: {score}/{mcqOptions.length} ({calculatePercentage()}%)
          //   </Typography>
          //   <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          //     {score === mcqOptions.length 
          //       ? "Perfect score! Well done!" 
          //       : score >= mcqOptions.length * 0.7 
          //       ? "Good job! Keep practicing!" 
          //       : "Keep studying and try again!"}
          //   </Typography>
          //   </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setSelectedAnswers(Array(mcqOptions.length).fill(null));
                setShowAnswers(false);
                setScore(0);
              }}
            >
              Try Again
            </Button>
          
        )}
      </Box>
    </Card>
    
  );
};

export default Mcq;