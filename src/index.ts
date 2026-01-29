#!/usr/bin/env node

import { Command } from 'commander';
import {
  authCommand,
  checkCommand,
  whoamiCommand,
  contactsCommand,
  contactCommand,
  contactSearchCommand,
  contactCreateCommand,
  contactUpdateCommand,
  companiesCommand,
  companyCommand,
  companySearchCommand,
  dealsCommand,
  dealCommand,
  dealSearchCommand,
  pipelinesCommand,
  ticketsCommand,
  ticketCommand,
  ticketSearchCommand,
  notesCommand,
  noteCreateCommand,
  tasksCommand,
  taskCommand,
  taskCreateCommand,
  associationsCommand,
  associateCommand,
} from './commands/index.js';

const program = new Command();

program
  .name('hs')
  .description('HubSpot CRM CLI for managing contacts, companies, deals, and engagements')
  .version('0.1.0');

// Auth commands
program.addCommand(authCommand);
program.addCommand(checkCommand);
program.addCommand(whoamiCommand);

// Contact commands
program.addCommand(contactsCommand);
program.addCommand(contactCommand);
program.addCommand(contactSearchCommand);
program.addCommand(contactCreateCommand);
program.addCommand(contactUpdateCommand);

// Company commands
program.addCommand(companiesCommand);
program.addCommand(companyCommand);
program.addCommand(companySearchCommand);

// Deal commands
program.addCommand(dealsCommand);
program.addCommand(dealCommand);
program.addCommand(dealSearchCommand);
program.addCommand(pipelinesCommand);

// Ticket commands
program.addCommand(ticketsCommand);
program.addCommand(ticketCommand);
program.addCommand(ticketSearchCommand);

// Engagement commands
program.addCommand(notesCommand);
program.addCommand(noteCreateCommand);
program.addCommand(tasksCommand);
program.addCommand(taskCommand);
program.addCommand(taskCreateCommand);

// Association commands
program.addCommand(associationsCommand);
program.addCommand(associateCommand);

program.parse();
