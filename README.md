# Node Bacnet

[![CI](https://github.com/innovation-system/node-bacnet/actions/workflows/ci.yml/badge.svg)](https://github.com/innovation-system/node-bacnet/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@innovation-system/node-bacnet.svg)](https://www.npmjs.com/package/@innovation-system/node-bacnet)
[![npm](https://img.shields.io/npm/dt/@innovation-system/node-bacnet.svg)](https://www.npmjs.com/package/@innovation-system/node-bacnet)
[![Coverage Status](https://coveralls.io/repos/github/innovation-system/node-bacnet/badge.svg?branch=master)](https://coveralls.io/github/innovation-system/node-bacnet?branch=master)

A BACnet® protocol stack written in pure TypeScript from contributors and maintained by [Innovation-System](https://www.innovation-system.it/).
BACnet® is a protocol to interact with building automation devices defined by ASHRAE.

<!-- vscode-markdown-toc -->
1. [Install](#Install)
2. [Docs](#Docs)
3. [Examples](#Examples)
4. [Features](#Features)
5. [Contribution](#Contribution)
6. [License](#License)
7. [Note](#Note)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## 1. <a name='Install'></a>Install

Run the following command
        npm install @innovation-system/node-bacnet

## 2. <a name='Docs'></a>Docs

Documentation is available [here](https://innovation-system.github.io/node-bacnet).

## 3. <a name='Examples'></a>Examples

Examples are available [here](https://github.com/innovation-system/node-bacnet/tree/master/examples)

## 4. <a name='Features'></a>Features

The BACnet standard defines a wide variety of services as part of it's
specification. While Node bacnet tries to be as complete as possible,
following services are already supported at this point in time:

| Service                        |                                      Execute                                      | Handle                                                                        |
|--------------------------------|:---------------------------------------------------------------------------------:|:-----------------------------------------------------------------------------:|
| Who Is                         | [yes](http://books.plus4nodered.com/ts-node-bacnet/whoIs)                        | [yes](http://books.plus4nodered.com/ts-node-bacnet/event:whoIs)       |
| I Am                           |                                       yes¹                                        | [yes](http://books.plus4nodered.com/ts-node-bacnet/event:iAm)         |
| Who Has                        |                                       yes¹                                        | yes¹                                                                          |
| I Have                         |                                       yes¹                                        | yes¹                                                                          |
| Time Sync                      |           [yes](http://books.plus4nodered.com/ts-node-bacnet/timeSync)           | [yes](http://books.plus4nodered.com/ts-node-bacnet/event:timeSync)    |
| UTC Time Sync                  |         [yes](http://books.plus4nodered.com/ts-node-bacnet/timeSyncUTC)          | [yes](http://books.plus4nodered.com/ts-node-bacnet/event:timeSyncUTC) |
| Read Property                  |         [yes](http://books.plus4nodered.com/ts-node-bacnet/readProperty)         | yes¹                                                                          |
| Read Property Multiple         |     [yes](http://books.plus4nodered.com/ts-node-bacnet/readPropertyMultiple)     | yes¹                                                                          |
| Read Range                     |          [yes](http://books.plus4nodered.com/ts-node-bacnet/readRange)           | yes¹                                                                          |
| Write Property                 |        [yes](http://books.plus4nodered.com/ts-node-bacnet/writeProperty)         | yes¹                                                                          |
| Write Property Multiple        |    [yes](http://books.plus4nodered.com/ts-node-bacnet/writePropertyMultiple)     | yes¹                                                                          |
| Add List Element               |                                       yes¹                                        | yes¹                                                                          |
| Remove List Element            |                                       yes¹                                        | yes¹                                                                          |
| Create Object                  |                                       yes¹                                        | yes¹                                                                          |
| Delete Object                  |         [yes](http://books.plus4nodered.com/ts-node-bacnet/deleteObject)         | yes¹                                                                          |
| Subscribe COV                  |         [yes](http://books.plus4nodered.com/ts-node-bacnet/subscribeCov)         | yes¹                                                                          |
| Subscribe Property             |      [yes](http://books.plus4nodered.com/ts-node-bacnet/subscribeProperty)       | yes¹                                                                          |
| Atomic Read File               |           [yes](http://books.plus4nodered.com/ts-node-bacnet/readFile)           | yes¹                                                                          |
| Atomic Write File              |          [yes](http://books.plus4nodered.com/ts-node-bacnet/writeFile)           | yes¹                                                                          |
| Reinitialize Device            |      [yes](http://books.plus4nodered.com/ts-node-bacnet/reinitializeDevice)      | yes¹                                                                          |
| Device Communication Control   |  [yes](http://books.plus4nodered.com/ts-node-bacnet/deviceCommunicationControl)  | yes¹                                                                          |
| Get Alarm Summary²             |       [yes](http://books.plus4nodered.com/ts-node-bacnet/getAlarmSummary)        | yes¹                                                                          |
| Get Event Information          |     [yes](http://books.plus4nodered.com/ts-node-bacnet/getEventInformation)      | yes¹                                                                          |
| Get Enrollment Summary²        |     [yes](http://books.plus4nodered.com/ts-node-bacnet/getEnrollmentSummary)     | yes¹                                                                          |
| Acknowledge Alarm              |                                       yes¹                                        | yes¹                                                                          |
| Confirmed Event Notification   |                                       yes¹                                        | yes¹                                                                          |
| Unconfirmed Event Notification |                                       yes¹                                        | yes¹                                                                          |
| Unconfirmed Private Transfer   |  [yes](http://books.plus4nodered.com/ts-node-bacnet/unconfirmedPrivateTransfer)  | yes¹                                                                          |
| Confirmed Private Transfer     |   [yes](http://books.plus4nodered.com/ts-node-bacnet/confirmedPrivateTransfer)   | yes¹                                                                          |

¹ Support implemented as Beta (untested, undocumented, breaking interface)
² Deprecated BACnet® function, available for backwards compatibility

## 5. <a name='Contribution'></a>Contribution

Special thanks to Fabio Huser for the [fundamental work](https://github.com/fh1ch/node-bacstack).

## 6. <a name='License'></a>License

MIT

* Copyright (c) 2025-present [Innovation-System](https://innovation-system.it/)
* Copyright (c) 2022-2024 [PLUS for Node-RED](http://plus4nodered.com/)
* origin Copyright (c) 2017-2021 Fabio Huser <fabio@fh1.ch>

## 7. <a name='Note'></a>Note

This is not an official product of the BACnet Advocacy Group.
BACnet® is a registered trademark of American Society of Heating, Refrigerating and Air-Conditioning Engineers (ASHRAE).
We're buying the specifications of ASHARE to programm for this library.
