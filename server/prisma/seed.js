import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@everafter.app';
const DEMO_PASSWORD = 'Demo1234!';
const DEMO_USER_ID = 'a0000000-0000-4000-8000-000000000001';
const DEMO_EVENT_ID = 'b0000000-0000-4000-8000-000000000001';
const DEMO_INVITATION_ID = 'c0000000-0000-4000-8000-000000000001';

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {
      email: DEMO_EMAIL,
      passwordHash,
      firstName: 'Eleanor',
      lastName: 'Ashford',
      emailVerifiedAt: new Date(),
      deletedAt: null,
    },
    create: {
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      passwordHash,
      firstName: 'Eleanor',
      lastName: 'Ashford',
      emailVerifiedAt: new Date(),
    },
  });

  const essencePlan = await prisma.subscriptionPlan.findFirst({
    where: { slug: 'essence', isActive: true },
  });

  if (essencePlan) {
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ['trialing', 'active', 'past_due'] },
      },
    });

    if (!existingSubscription) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: essencePlan.id,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  const template = await prisma.invitationTemplate.findFirst({
    where: { slug: 'golden-hour', isActive: true },
  });

  const event = await prisma.event.upsert({
    where: { id: DEMO_EVENT_ID },
    update: {
      ownerId: user.id,
      title: 'Eleanor & James',
      partnerOne: 'Eleanor',
      partnerTwo: 'James',
      eventDate: new Date('2026-09-12'),
      venueName: 'The Glasshouse at Syon',
      venueAddress: 'Syon Park, Brentford, London TW8 8JF',
      coverImageUrl: '/img/dashboard/lake.png',
      deletedAt: null,
    },
    create: {
      id: DEMO_EVENT_ID,
      ownerId: user.id,
      title: 'Eleanor & James',
      partnerOne: 'Eleanor',
      partnerTwo: 'James',
      eventDate: new Date('2026-09-12'),
      venueName: 'The Glasshouse at Syon',
      venueAddress: 'Syon Park, Brentford, London TW8 8JF',
      coverImageUrl: '/img/dashboard/lake.png',
    },
  });

  const invitation = await prisma.invitation.upsert({
    where: { id: DEMO_INVITATION_ID },
    update: {
      eventId: event.id,
      templateId: template?.id ?? null,
      slug: 'eleanor-and-james',
      status: 'published',
      headline: 'Together, Forever',
      subheadline: 'We invite you to celebrate our wedding',
      bodyContent: 'Join us for an evening of love, laughter, and celebration.',
      themeConfig: {
        primary: '#6d5c43',
        fontDisplay: 'Playfair Display',
        fontBody: 'Inter',
      },
      publishedAt: new Date(),
      deletedAt: null,
    },
    create: {
      id: DEMO_INVITATION_ID,
      eventId: event.id,
      templateId: template?.id ?? null,
      slug: 'eleanor-and-james',
      status: 'published',
      headline: 'Together, Forever',
      subheadline: 'We invite you to celebrate our wedding',
      bodyContent: 'Join us for an evening of love, laughter, and celebration.',
      themeConfig: {
        primary: '#6d5c43',
        fontDisplay: 'Playfair Display',
        fontBody: 'Inter',
      },
      publishedAt: new Date(),
    },
  });

  const guests = [
    {
      id: 'd0000000-0000-4000-8000-000000000001',
      email: 'sarah.chen@example.com',
      firstName: 'Sarah',
      lastName: 'Chen',
      role: 'guest',
      category: 'family',
      partySize: 2,
      accessToken: 'demo-guest-token-sarah-chen',
    },
    {
      id: 'd0000000-0000-4000-8000-000000000002',
      email: 'marcus.wright@example.com',
      firstName: 'Marcus',
      lastName: 'Wright',
      role: 'guest',
      category: 'friends',
      partySize: 1,
      accessToken: 'demo-guest-token-marcus-wright',
    },
    {
      id: 'd0000000-0000-4000-8000-000000000003',
      email: 'james@example.com',
      firstName: 'James',
      lastName: 'Ashford',
      role: 'partner',
      category: 'family',
      partySize: 1,
      accessToken: 'demo-guest-token-james-ashford',
    },
  ];

  for (const guest of guests) {
    await prisma.guest.upsert({
      where: { id: guest.id },
      update: {
        eventId: event.id,
        email: guest.email,
        firstName: guest.firstName,
        lastName: guest.lastName,
        role: guest.role,
        category: guest.category,
        partySize: guest.partySize,
        accessToken: guest.accessToken,
        deletedAt: null,
      },
      create: {
        id: guest.id,
        eventId: event.id,
        email: guest.email,
        firstName: guest.firstName,
        lastName: guest.lastName,
        role: guest.role,
        category: guest.category,
        partySize: guest.partySize,
        accessToken: guest.accessToken,
      },
    });
  }

  await prisma.rsvp.upsert({
    where: {
      guestId_invitationId: {
        guestId: guests[0].id,
        invitationId: invitation.id,
      },
    },
    update: {
      status: 'attending',
      attendingCount: 2,
      respondedAt: new Date(),
    },
    create: {
      guestId: guests[0].id,
      invitationId: invitation.id,
      status: 'attending',
      attendingCount: 2,
      respondedAt: new Date(),
    },
  });

  await prisma.rsvp.upsert({
    where: {
      guestId_invitationId: {
        guestId: guests[1].id,
        invitationId: invitation.id,
      },
    },
    update: {
      status: 'pending',
      attendingCount: 0,
      respondedAt: null,
    },
    create: {
      guestId: guests[1].id,
      invitationId: invitation.id,
      status: 'pending',
      attendingCount: 0,
    },
  });

  console.log('Seed complete.');
  console.log(`Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
