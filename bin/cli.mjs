#!/usr/bin/env node
import { MessageBus } from '../messagebus.mjs';
const messageBus = new MessageBus();
messageBus.start();