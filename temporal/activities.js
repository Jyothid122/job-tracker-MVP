import { proxyActivities } from '@temporalio/workflow';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCoverLetter(company, role, jobDescription) {
  try {
    console.log(`Generating cover letter for ${role} at ${company}`);
    
    const prompt = `Write a professional, personalized cover letter for the position of ${role} at ${company}. 
    
    Job Description: ${jobDescription}
    
    Requirements:
    - Professional and engaging tone
    - Highlight relevant skills and experience
    - Show enthusiasm for the role and company
    - Keep it concise (3-4 paragraphs)
    - Address it to "Hiring Manager"
    - Include a strong closing statement
    
    Make it specific to this role and company, not generic.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const coverLetter = response.choices[0].message.content;
    console.log('Cover letter generated successfully');
    
    return {
      content: coverLetter,
      generatedAt: new Date().toISOString(),
      company,
      role
    };
    
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error(`Failed to generate cover letter: ${error.message}`);
  }
}

export async function sendReminder(applicationData) {
  try {
    const { company, role, deadline } = applicationData;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    console.log(`Sending reminder for ${role} at ${company} - ${daysUntilDeadline} days until deadline`);
    
    // In a real implementation, you would send email, SMS, or push notification here
    // For now, we'll just log the reminder
    const reminderMessage = `REMINDER: Application deadline for ${role} at ${company} is in ${daysUntilDeadline} days (${deadline})`;
    console.log(reminderMessage);
    
    return {
      sent: true,
      message: reminderMessage,
      sentAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error sending reminder:', error);
    throw new Error(`Failed to send reminder: ${error.message}`);
  }
}

export async function updateApplicationStatus(applicationId, status) {
  try {
    console.log(`Updating application ${applicationId} status to: ${status}`);
    
    // In a real implementation, you would update the database here
    // For now, we'll just log the update
    return {
      applicationId,
      status,
      updatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error updating application status:', error);
    throw new Error(`Failed to update application status: ${error.message}`);
  }
}
