import { Client } from '@notionhq/client';

if (!process.env.NOTION_API_KEY) {
  throw new Error('Missing NOTION_API_KEY environment variable');
}

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const DATABASES = {
  PARTICIPANTS: process.env.NOTION_PARTICIPANTS_DB,
  BOOTHS: process.env.NOTION_BOOTHS_DB,
  TRANSACTIONS: process.env.NOTION_TRANSACTIONS_DB,
};

export interface Participant {
  phone: string;
  password: string;
  isActivated: boolean;
  balance: number;
}

export interface Booth {
  id: string;
  name: string;
  balance: number;
}

export interface Transaction {
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
      database_id: DATABASES.PARTICIPANTS!,
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

    const page = response.results[0];
    const properties = page.properties as any;

    return {
      phone: properties['Name'].title[0]?.plain_text || '',
      password: properties['密码']?.rich_text[0]?.plain_text || '',
      isActivated: properties['是否已激活']?.checkbox || false,
      balance: properties['账户余额']?.number || 0
    };
  } catch (error) {
    console.error('Error fetching participant:', error);
    return null;
  }
}

export async function updateParticipant(phone: string, data: Partial<Participant>) {
  try {
    const response = await notion.databases.query({
      database_id: DATABASES.PARTICIPANTS!,
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
      database_id: DATABASES.BOOTHS!,
      sorts: [
        {
          property: 'Name',
          direction: 'ascending'
        }
      ]
    });

    return response.results.map(page => {
      const properties = page.properties as any;
      return {
        id: properties['Name'].title[0]?.plain_text || '',
        name: properties['摊位名称']?.rich_text[0]?.plain_text || '',
        balance: properties['账户余额']?.number || 0
      };
    });
  } catch (error) {
    console.error('Error fetching booths:', error);
    return [];
  }
}

export async function updateBoothBalance(boothId: string, newBalance: number) {
  try {
    const response = await notion.databases.query({
      database_id: DATABASES.BOOTHS!,
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
    const currentBooth = response.results[0].properties as any;
    const currentBalance = currentBooth['账户余额']?.number || 0;

    await notion.pages.update({
      page_id: pageId,
      properties: {
        '账户余额': {
          number: currentBalance + newBalance
        }
      }
    });
  } catch (error) {
    console.error('Error updating booth balance:', error);
    throw error;
  }
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>) {
  try {
    await notion.pages.create({
      parent: {
        database_id: DATABASES.TRANSACTIONS!
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
