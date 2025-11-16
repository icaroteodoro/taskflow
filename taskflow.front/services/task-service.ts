import api from "@/lib/axios";
import { getEmailFromToken } from "./token-service";

export interface Occurrence {
    date: string;
    occurrenceID: string
    status: string;
    taskId: string;
    title: string;
    type: "DAILY" | "SINGLE";
}

export interface Task {
    id: string,
    title: string,
    description: string,
    type: "DAILY" | "SINGLE",
    date: string
}

export interface CreateTaskRequest {
    title: string;
    description: string;
    type: "DAILY" | "SINGLE";
    date: string;
}

export interface ApiError {
    message: string;
    status?: number;
    errors?: Record<string, string[]>;
}

export async function createTask(task: CreateTaskRequest) {
    const email = await getEmailFromToken();
    const response = await api.post('/tasks/user/' + email, task);
    return response.data;
}

export async function getUserTasks() {
    const email = await getEmailFromToken();
    const response = await api.get('/tasks/user/' + email);
    return response.data;
}

export async function getTasksForToday() {
    const email = await getEmailFromToken();
    const response = await api.get('/tasks/user/' + email + '/today');
    return response.data;
}

export async function toggleTask(taskId: string, date: string) {
    const response = await api.put(`/tasks/${taskId}/toggle/${date}`);
    return response.data;
}

export async function getTaskById(taskId: string) {
    const response = await api.get('/tasks/' + taskId);
    return response.data;
}

export async function getTasksByDay(date:string){
    const email = await getEmailFromToken();
    const response = await api.get('/tasks/user/' + email + "/day/" + date);
    return response.data;
}