
import { Survey, SurveyStatistics } from '../../domain/models/Survey';
import { SurveyRepository } from '../../domain/repositories/SurveyRepository';
import { supabase } from '../../integrations/supabase/client';
import { Json } from '../../integrations/supabase/types';

export class SupabaseSurveyRepository implements SurveyRepository {
  async getAllSurveys(): Promise<Survey[]> {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(this.mapToSurvey);
  }

  async getSurveyById(id: string): Promise<Survey | null> {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    if (!data) return null;
    
    return this.mapToSurvey(data);
  }

  async createSurvey(survey: Omit<Survey, 'id' | 'createdAt'>): Promise<Survey> {
    const { data, error } = await supabase
      .from('surveys')
      .insert({
        title: survey.title,
        description: survey.description,
        questions: survey.questions as unknown as Json,
      })
      .select();

    if (error) throw error;
    
    return this.mapToSurvey(data[0]);
  }

  async updateSurvey(survey: Survey): Promise<boolean> {
    const { error } = await supabase
      .from('surveys')
      .update({
        title: survey.title,
        description: survey.description,
        questions: survey.questions as unknown as Json,
      })
      .eq('id', survey.id);

    return !error;
  }

  async deleteSurvey(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id);

    return !error;
  }

  async getSurveysByStatus(status: string): Promise<Survey[]> {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(this.mapToSurvey);
  }

  async getSurveyStatistics(surveyId: string): Promise<SurveyStatistics> {
    // Define a simplified type for survey responses to avoid type recursion
    type SimpleAnswer = string | string[] | number | boolean | null;
    
    interface SimpleResponse {
      survey_id: string;
      id: string;
      respondent_name: string;
      respondent_email: string | null;
      respondent_company: string | null;
      respondent_phone: string | null;
      submitted_at: string;
      completion_time?: number;
      answers: Record<string, SimpleAnswer>;
    }

    // Fetch the survey responses
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId);

    if (error) throw error;

    // Transform the data to match our simplified type
    const responses: SimpleResponse[] = [];
    
    if (data) {
      for (const item of data) {
        // Create a new response object with our simplified structure
        const responseData: SimpleResponse = {
          survey_id: item.survey_id,
          id: item.id,
          respondent_name: item.respondent_name,
          respondent_email: item.respondent_email,
          respondent_company: item.respondent_company,
          respondent_phone: item.respondent_phone,
          submitted_at: item.submitted_at,
          answers: {}
        };
        
        // Safely handle completion_time which may not exist in the type
        // Access it using bracket notation to avoid TypeScript errors
        const completionTime = (item as any)['completion_time'];
        if (typeof completionTime === 'number') {
          responseData.completion_time = completionTime;
        } else if (typeof completionTime === 'string') {
          responseData.completion_time = Number(completionTime);
        }
        
        // Safely handle answers
        if (item.answers && typeof item.answers === 'object') {
          // Use a type assertion to handle complex JSON types
          responseData.answers = item.answers as Record<string, SimpleAnswer>;
        }
        
        responses.push(responseData);
      }
    }

    // Get the survey details
    const survey = await this.getSurveyById(surveyId);
    if (!survey) throw new Error('Survey not found');

    // Calculate statistics
    const totalResponses = responses.length;
    
    // Calculate average completion time
    let averageCompletionTime = 0;
    let completionTimeSum = 0;
    let completionTimeCount = 0;
    
    for (const response of responses) {
      if (response.completion_time !== undefined) {
        completionTimeSum += response.completion_time;
        completionTimeCount++;
      }
    }
    
    if (completionTimeCount > 0) {
      averageCompletionTime = completionTimeSum / completionTimeCount;
    }
    
    // Calculate statistics per question
    const questionStats = survey.questions.map(question => {
      const answerCounts: Record<string, number> = {};
      
      for (const response of responses) {
        if (!response.answers) continue;
        
        const answer = response.answers[question.id];
        if (answer === undefined || answer === null) continue;
        
        const answerKey = Array.isArray(answer) ? answer.join(', ') : String(answer);
        answerCounts[answerKey] = (answerCounts[answerKey] || 0) + 1;
      }
      
      return {
        questionId: question.id,
        questionTitle: question.title,
        responses: Object.entries(answerCounts).map(([answer, count]) => ({
          answer,
          count,
          percentage: totalResponses ? (count / totalResponses) * 100 : 0
        }))
      };
    });

    // Calculate completion rate
    let completedResponsesCount = 0;
    
    for (const response of responses) {
      if (response.answers && Object.keys(response.answers).length > 0) {
        completedResponsesCount++;
      }
    }
    
    const completionRate = totalResponses ? (completedResponsesCount / totalResponses) * 100 : 0;
    
    // Return the statistics
    return {
      totalResponses,
      averageCompletionTime,
      completionRate,
      questionStats
    };
  }

  async sendSurveyEmails(surveyId: string, emailAddresses: string[]): Promise<boolean> {
    try {
      console.log(`Sending survey ${surveyId} to emails: ${emailAddresses.join(', ')}`);
      return true;
    } catch (error) {
      console.error('Error sending survey emails', error);
      return false;
    }
  }

  private mapToSurvey(data: any): Survey {
    let parsedQuestions;
    try {
      parsedQuestions = Array.isArray(data.questions) 
        ? data.questions.map((q: any) => ({
            id: q.id || '',
            title: q.title || '',
            description: q.description,
            type: q.type || '',
            required: q.required || false,
            options: q.options,
            settings: q.settings
          }))
        : [];
    } catch (e) {
      console.error('Error parsing questions:', e);
      parsedQuestions = [];
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      questions: parsedQuestions,
      createdAt: data.created_at
    };
  }
}
