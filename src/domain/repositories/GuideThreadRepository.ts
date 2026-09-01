import { GuideThread, GuideTurn, PassageRef } from '../models';

/**
 * Repository interface for persisting guide conversation threads
 */
export interface GuideThreadRepository {
  /**
   * Get a thread by ID
   */
  getThread(id: string): Promise<GuideThread | null>;

  /**
   * Get all threads, sorted by most recent
   */
  getAllThreads(): Promise<GuideThread[]>;

  /**
   * Create a new thread
   */
  createThread(passageRef?: PassageRef): Promise<GuideThread>;

  /**
   * Add a turn to a thread
   */
  addTurn(threadId: string, turn: GuideTurn): Promise<void>;

  /**
   * Delete a thread
   */
  deleteThread(id: string): Promise<void>;
}
