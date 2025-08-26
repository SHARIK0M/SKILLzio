import { IQuiz,QuizModel } from "../../models/quizModel";
import { GenericRepository } from "./generic.Repository";

export class QuizDetailRepository extends GenericRepository<IQuiz>{
    constructor(){
        super(QuizModel)
    }
}