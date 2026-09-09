import { generateAdaptivePlan } from '@/features/dailyPath/AdaptivePlanEngine';
import { UserIntakeAnswers } from '@/domain/models/IntakeQuestionnaire';
import { BibleBook } from '@/domain/models/BibleBook';

describe('AdaptivePlanEngine', () => {
  it('generates a peace in psalms gentle plan', () => {
    const answers: UserIntakeAnswers = {
      focus: 'peace',
      depth: 'gentle',
      genre: 'psalms',
    };

    const plan = generateAdaptivePlan(answers);

    expect(plan.title).toBe('Peace in the Psalms');
    expect(plan.subtitle).toContain('Gentle Plan');
    expect(plan.passageRef).toEqual({
      book: BibleBook.Psalms,
      chapter: 23,
      verseStart: 1,
      verseEnd: 3,
    });
    expect(plan.arrivePrompt).toBeTruthy();
    expect(plan.reflectPrompt).toBeTruthy();
    expect(plan.respondPrompt).toBeTruthy();
  });

  it('generates a deep gospels plan for seeking wisdom', () => {
    const answers: UserIntakeAnswers = {
      focus: 'wisdom',
      depth: 'deep',
      genre: 'gospels',
    };

    const plan = generateAdaptivePlan(answers);

    expect(plan.title).toBe('Teachings of the Kingdom');
    expect(plan.subtitle).toContain('Deep Plan');
    expect(plan.passageRef.book).toBe(BibleBook.Matthew);
    expect(plan.passageRef.chapter).toBe(5);
  });

  it('falls back gracefully for any valid combination', () => {
    const answers: UserIntakeAnswers = {
      focus: 'difficulty',
      depth: 'focused',
      genre: 'epistles',
    };

    const plan = generateAdaptivePlan(answers);

    expect(plan.title).toBe('Endurance & Hope');
    expect(plan.passageRef.book).toBe(BibleBook.Romans);
  });
});
