import { IQuiz,QuizModel } from "../../models/quiz.Model";
import { GenericRepository } from "./generic.Repository";

export class QuizDetailRepository extends GenericRepository<IQuiz>{
    constructor(){
        super(QuizModel)
    }
}