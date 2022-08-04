import inquirer from 'inquirer';
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git';
import { logger } from './logger.js';

const git: SimpleGit = simpleGit().clean(CleanOptions.FORCE);

export const gitCheck = async (): Promise<boolean> => {
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    logger.warn('No repo found.');
    return true;
  }

  const status = await git.status();
  if (status.isClean()) {
    logger.skip('Nothing to commit, continuing...');
    return true;
  }

  const { shouldCommit } = await inquirer.prompt([
    {
      type: 'list',
      message: 'You got uncommited changes, what should we do?',
      name: 'shouldCommit',
      default: 'commit',
      choices: [
        {
          name: 'Commit my changes now',
          short: 'Commit',
          value: 'commit',
        },
        {
          name: 'Ignore my changes & continue without commiting',
          short: 'Ignore & continue',
          value: 'continue',
        },
        {
          name: 'Abort',
          value: 'abort',
        },
      ],
    },
  ]);

  if (shouldCommit === 'commit') {
    const { commitMessage } = await inquirer.prompt([
      {
        type: 'input',
        name: 'commitMessage',
        message: 'Provide commit message.',
        default: () => 'Changes before generating ACF modules files',
        validate: (input) => input.trim().length > 0,
      },
    ]);

    logger.start('Commiting');
    await git.add('.');
    await git.commit(commitMessage);
    logger.complete('Changes commited successfully!');

    return true;
  }
  if (shouldCommit === 'continue') {
    logger.skip('Continuing without commiting.');
    return true;
  }
  if (shouldCommit === 'abort') {
    throw new Error('Abort!');
  }

  return true;
};
