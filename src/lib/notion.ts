import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

if (!process.env.NOTION_API_KEY) {
  throw new Error('Missing NOTION_API_KEY environment variable');
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

if (!process.env.NOTION_PARTICIPANTS_DB) {
  throw new Error('Missing NOTION_PARTICIPANTS_DB environment variable');
}

if (!process.env.NOTION_BOOTHS_DB) {
  throw new Error('Missing NOTION_BOOTHS_DB environment variable');
}

if (!process.env.NOTION_TRANSACTIONS_DB) {
  throw new Error('Missing NOTION_TRANSACTIONS_DB environment variable');
}

interface Participant {
  phone: string;
  password: string;
  isActivated: boolean;
  balance: number;
}

interface Booth {
  id: string;
  name: string;
  balance: number;
}

interface Transaction {
  id: string;
  participantPhone: string;
  boothId: string;
  boothName: string;
  amount: number;
  note: string;
  timestamp: string;
}

export async function getParticipant(phone: string): Promise<Participant | null> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_PARTICIPANTS_DB!,
      filter: {
        property: 'Name',
        title: {
          equals: phone
        }
      }
    });

    if (!response.results.length) {
      return null;
    }

    const page = response.results[0] as PageObjectResponse;

    // Type guard to ensure we're working with the correct property types
    if (!('properties' in page)) {
      throw new Error('Invalid page object structure');
    }

    const props = page.properties;
    
    // Type guards for each property
    const nameProperty = props['Name'];
    const passwordProperty = props['密码'];
    const activatedProperty = props['是否已激活'];
    const balanceProperty = props['账户余额'];

    if (
      !nameProperty || 
      nameProperty.type !== 'title' ||
      !passwordProperty || 
      passwordProperty.type !== 'rich_text' ||
      !activatedProperty || 
      activatedProperty.type !== 'checkbox' ||
      !balanceProperty || 
      balanceProperty.type !== 'number'
    ) {
      throw new Error('Invalid property structure');
    }

    return {
      phone: nameProperty.title[0]?.plain_text || '',
      password: passwordProperty.rich_text[0]?.plain_text || '',
      isActivated: activatedProperty.checkbox || false,
      balance: balanceProperty.number || 0
    };
  } catch (error) {
    console.error('Error fetching participant:', error);
    return null;
  }
}

export async function updateParticipant(phone: string, data: Partial<Participant>) {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_PARTICIPANTS_DB!,
      filter: {
        property: 'Name',
        title: {
          equals: phone
        }
      }
    });

    if (!response.results.length) {
      throw new Error('Participant not found');
    }

    const pageId = response.results[0].id;
    await notion.pages.update({
      page_id: pageId,
      properties: {
        ...(data.password && {
          '密码': {
            rich_text: [{ text: { content: data.password } }]
          }
        }),
        ...(data.isActivated !== undefined && {
          '是否已激活': {
            checkbox: data.isActivated
          }
        }),
        ...(data.balance !== undefined && {
          '账户余额': {
            number: data.balance
          }
        })
      }
    });
  } catch (error) {
    console.error('Error updating participant:', error);
    throw error;
  }
}

export async function getAllBooths(): Promise<Booth[]> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_BOOTHS_DB!,
      sorts: [
        {
          property: 'Name',
          direction: 'ascending',
        },
      ],
    });

    return response.results.map((page) => {
      const pageObj = page as PageObjectResponse;
      if (!('properties' in pageObj)) {
        throw new Error('Invalid page object structure');
      }

      const props = pageObj.properties;
      const nameProperty = props['Name'];
      const balanceProperty = props['账户余额'];
      const boothNameProperty = props['摊位名称'];

      if (
        !nameProperty || 
        nameProperty.type !== 'title' ||
        !balanceProperty || 
        balanceProperty.type !== 'number' ||
        !boothNameProperty ||
        boothNameProperty.type !== 'rich_text'
      ) {
        throw new Error('Invalid property structure');
      }

      return {
        id: nameProperty.title[0]?.plain_text || '',
        name: boothNameProperty.rich_text[0]?.plain_text || '',
        balance: balanceProperty.number || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching booths:', error);
    return [];
  }
}

export async function updateBoothBalance(boothId: string, amount: number) {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_BOOTHS_DB!,
      filter: {
        property: 'Name',
        title: {
          equals: boothId
        }
      }
    });

    if (!response.results.length) {
      throw new Error('Booth not found');
    }

    const pageId = response.results[0].id;
    const page = response.results[0] as PageObjectResponse;
    
    if (!('properties' in page)) {
      throw new Error('Invalid page object structure');
    }

    const props = page.properties;
    const balanceProperty = props['账户余额'];

    if (!balanceProperty || balanceProperty.type !== 'number') {
      throw new Error('Invalid balance property structure');
    }

    const currentBalance = balanceProperty.number || 0;
    const newBalance = currentBalance + amount;

    await notion.pages.update({
      page_id: pageId,
      properties: {
        '账户余额': {
          type: 'number',
          number: newBalance
        }
      }
    });

    return {
      success: true,
      newBalance
    };
  } catch (error) {
    console.error('Error updating booth balance:', error);
    throw error;
  }
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>) {
  try {
    await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_TRANSACTIONS_DB!
      },
      properties: {
        'Name': {
          title: [{ text: { content: `${transaction.participantPhone}-${transaction.boothId}` } }]
        },
        '参会者手机号': {
          rich_text: [{ text: { content: transaction.participantPhone } }]
        },
        '摊位编号': {
          rich_text: [{ text: { content: transaction.boothId } }]
        },
        '摊位名称': {
          rich_text: [{ text: { content: transaction.boothName } }]
        },
        '转账积分额': {
          number: transaction.amount
        },
        '交易备注': {
          rich_text: [{ text: { content: transaction.note } }]
        },
        '交易时间': {
          date: {
            start: transaction.timestamp
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}
