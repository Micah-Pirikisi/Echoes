import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import prisma from "./src/config/prisma.js";

async function main() {
  console.log("Seeding...");
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.followRequest.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // Dragon Age Inquisition characters
  const daiCharacters = [
    {
      email: "cassandra@inquisition.org",
      name: "Cassandra Pentaghast",
      username: "CassandraSeeker",
      bio: "Seeker of the Chantry. Discipline, duty, and honor.",
      avatarUrl:
        "https://res.cloudinary.com/do3ipiak8/image/upload/v1767778497/echoes-avatars/cassandra.jpg",
      posts: [
        "If they lie, I will know. If they run, I will catch them.",
        "The Seeker's armor must reflect both discipline and purpose.",
        "Sparring practice complete. Only two training dummies destroyed today. I am losing my edge.",
        "Interrogating suspects is an art form. Most people don't survive the lecture.",
        "*For research purposes only.* Not because I enjoy it. Obviously.",
      ],
    },
    {
      email: "varric@storyteller.net",
      name: "Varric Tethras",
      username: "VarricStories",
      bio: "Dwarf rogue, storyteller, and absolutely not a bard.",
      avatarUrl:
        "https://res.cloudinary.com/do3ipiak8/image/upload/v1767778506/echoes-avatars/varric.jpg",
      posts: [
        "Another chapter of 'Swords & Shields' is selling like hotcakes. The nobles can't get enough of it.",
        "Sitting in a tavern. Living the dream. Cassandra will yell at me later, but it's worth it.",
        "Hawke would have loved this chaos. I miss that lunatic.",
        "The crossbow never lies. Unlike most people I know.",
        "Writing is hard. Drinking is easier. That's what I've learned today.",
      ],
    },
    {
      email: "sera@redjennysfriend.net",
      name: "Sera",
      username: "SeraChaos",
      bio: "Friend of Red Jenny. Chaos is my strategy.",
      avatarUrl:
        "https://res.cloudinary.com/do3ipiak8/image/upload/v1767778501/echoes-avatars/sera.jpg",
      posts: [
        "Stole a Templars' helm and replaced it with a bucket. Worth it.",
        "The Maker probably wouldn't approve of my methods. But the Maker isn't here, is he?",
        "Blew up some important official's outhouse today. No regrets. Well, maybe some.",
        "Pies taste better when they're actually pies and not some fancy Orlesian thing.",
        "Being a rogue is fun. Angering Cassandra is even better.",
      ],
    },
    {
      email: "solas@canis.lupus",
      name: "Solas",
      username: "SolasApostate",
      bio: "Apostate mage. Keeper of secrets. Definitely not Fen'Harel.",
      avatarUrl:
        "https://res.cloudinary.com/do3ipiak8/image/upload/v1767778504/echoes-avatars/solas.jpg",
      posts: [
        "The Veil is thinner than most realize. Pay attention to what fades.",
        "Spent the day in meditation. The Fade has much to teach those who listen.",
        "Another artifact discovered. Each one tells a story of what was lost.",
        "Mortals worry so much about tomorrow. They should worry about yesterday.",
        "The future is not written. But it rhymes with the past.",
      ],
    },
    {
      email: "inquisitor@inquisition.org",
      name: "The Inquisitor",
      username: "TheInquisitor",
      bio: "Accidental Herald of Andraste. Accidentally causes chaos everywhere.",
      avatarUrl:
        "https://res.cloudinary.com/do3ipiak8/image/upload/v1767778500/echoes-avatars/inquisitor.jpg",
      posts: [
        "Who approved me leading this organization? Also, how do I close rifts again?",
        "Successfully convinced everyone that thing wasn't a demon. It totally was.",
        "If I had a copper for every time someone called me 'Herald,' I could hire a herald to say it for me.",
        "Broke a priceless ancient artifact today. Cassandra's eye is twitching again.",
        "Declared war on a dragon before realizing what it was. Somehow we're winning?",
        "Varric keeps writing about my adventures. They're getting more inaccurate each time. I love it.",
      ],
    },
    {
      email: "dorian@tevinter.imperium",
      name: "Dorian Pavus",
      username: "DorianPavus",
      bio: "Magister's son. Venhedis enthusiast. Better at witty remarks than fire spells.",
      posts: [
        "Just defeated a red templar with style and absolutely zero grace. Still counts.",
        "Being from Tevinter is like being from the fashion capital... of bad decisions.",
        "The Inquisitor is insufferable. In a way that's almost endearing.",
        "Watching Sera cause chaos is far more entertaining than I'd like to admit.",
        "Drinking wine and complaining about my father. A tradition as old as Tevinter itself.",
      ],
    },
    {
      email: "vivienne@orlais.court",
      name: "Vivienne",
      username: "VivienneEnchantress",
      bio: "First Enchantress. Orlesian Court mage. Elegance is not negotiable.",
      posts: [
        "The Inquisition's fashion choices need serious intervention. I'll take the lead.",
        "A lady never reveals her secrets. But she does reveal her magical superiority.",
        "Orlesian politics are like dancing. Everyone must follow my lead.",
        "Blood magic is crude. Everything I do is refined and absolutely devastating.",
        "Rejected three marriage proposals today. Standards must be maintained.",
      ],
    },
    {
      email: "bull@chargers.net",
      name: "The Iron Bull",
      username: "IronBullChargers",
      bio: "Qunari warrior. Former Ben-Hassrath. Now just trying to enjoy life.",
      posts: [
        "Broke my sword on that dragon's skull. Worth every copper.",
        "The Chargers threw me a party. Best night of my life.",
        "Fighting for the Inquisition beats serving the Qun any day.",
        "Pretty sure I drank everyone under the table last night. My head disagrees.",
        "There's nothing better than a good fight with good people. Except maybe ale.",
      ],
    },
    {
      email: "blackwall@wardens.org",
      name: "Blackwall",
      username: "BlackwallWarden",
      bio: "Grey Warden. Defender of the innocent. Trying to make amends.",
      avatarUrl:
        "https://res.cloudinary.com/do3ipiak8/image/upload/v1767778332/echoes-avatars/blackwall-profile.jpg",
      posts: [
        "The darkspawn never rest. Neither do I.",
        "Griffons are magnificent creatures. I miss them.",
        "Duty is everything. Even when you've failed at it before.",
        "Watched the sunrise over the Bannorn. Reminded me why I fight.",
        "The Order is broken, but its ideals never will be.",
      ],
    },
    {
      email: "cole@spirit.child",
      name: "Cole",
      username: "ColeTheSpirit",
      bio: "Spirit. Ghost. Knife. Helping people.",
      posts: [
        "People hurt. I make it stop. It's what I do.",
        "The Inquisitor sees me as real. That's new. That's good.",
        "Memories stick to people like blood. I can wash it away.",
        "Learning what it means to be human. It's beautiful and awful.",
        "A blade isn't always the answer. Sometimes words cut deeper.",
      ],
    },
    {
      email: "leilani@divine.inquisition",
      name: "Leliana",
      username: "LelianaSpymaster",
      bio: "Spymaster. Divine. Keeper of secrets and keeper of faith.",
      posts: [
        "A bird came back with news from Val Royeaux. Orlais is delicious with chaos.",
        "Knowledge is power. Secrets are weapons.",
        "The path of the Divine is not what I expected. But perhaps it's what I needed.",
        "My agents see everything. My birds bring back what matters.",
        "Faith and blades go hand in hand. Neither is complete without the other.",
      ],
    },
  ];

  const users = await Promise.all(
    daiCharacters.map((char) =>
      prisma.user.create({
        data: {
          email: char.email,
          passwordHash,
          name: char.name,
          username: char.username,
          bio: char.bio,
          avatarUrl: char.avatarUrl,
        },
      })
    )
  );

  const guest = await prisma.user.create({
    data: {
      email: process.env.GUEST_EMAIL || "guest@example.com",
      passwordHash: await bcrypt.hash(
        process.env.GUEST_PASSWORD || "guestpass123",
        10
      ),
      name: "Guest",
      avatarUrl: "https://www.gravatar.com/avatar?d=identicon",
      isGuest: true,
    },
  });

  const authors = [...users, guest];

  // Originals - use character-specific posts
  const posts = [];
  for (let i = 0; i < authors.length; i++) {
    const author = authors[i];
    const characterPosts =
      i < daiCharacters.length ? daiCharacters[i].posts : null;

    const created = await Promise.all(
      (characterPosts || []).map((content) =>
        prisma.post.create({
          data: {
            authorId: author.id,
            content,
          },
        })
      )
    );
    posts.push(...created);
  }

  // Character-specific echo responses and reactions
  const echoCommentsByCharacter = {
    "Cassandra Pentaghast": [
      "This requires investigation.",
      "Your methods are unconventional, but not ineffective.",
      "Well said.",
    ],
    "Varric Tethras": [
      "Now that's a good story. Mind if I steal this for my book?",
      "Ha! Not bad, not bad at all.",
      "This one's going in Chapter 47.",
    ],
    Sera: [
      "That's brilliant, that is! Absolutely mental!",
      "Ha! Serves 'em right!",
      "More of this, less of that stuffy nonsense.",
    ],
    Solas: [
      "An interesting perspective.",
      "The Fade echoes similar sentiments.",
      "One would be wise to heed such counsel.",
    ],
    "The Inquisitor": [
      "I feel that in my bones.",
      "Someone else gets it. Finally.",
      "This is why we fight.",
    ],
    "Dorian Pavus": [
      "Couldn't have said it better myself, darling.",
      "Witty. I approve.",
      "A sentiment worthy of Orlesian court.",
    ],
    Vivienne: [
      "Precisely.",
      "A most astute observation.",
      "Standards, dear. Always.",
    ],
    "The Iron Bull": [
      "That's what I'm talking about!",
      "Good point, horns.",
      "You and me both, friend.",
    ],
    Blackwall: [
      "Duty demands much of us.",
      "Spoken like a true soldier.",
      "The Warden would have agreed.",
    ],
    Cole: [
      "You feel that too. I see it in you.",
      "Truth. Real and sharp.",
      "It helps people. That matters.",
    ],
    Leliana: [
      "My agents report similar findings.",
      "Wisdom wrapped in steel.",
      "The Divine smiles on such resolve.",
    ],
    Guest: ["Interesting take.", "I agree with this.", "Well put."],
  };

  const echoReactionsByCharacter = {
    "Cassandra Pentaghast": [
      "A sentiment I can respect.",
      "This deserves attention.",
      "Sharply observed.",
    ],
    "Varric Tethras": [
      "Now this is the stuff worth talking about.",
      "Couldn't have said it better myself.",
      "Mark this one down.",
    ],
    Sera: [
      "This is exactly what I'm talking about!",
      "Finally, someone with sense!",
      "Brilliant, absolutely brilliant!",
    ],
    Solas: [
      "History repeats itself in subtle ways.",
      "Few grasp such truths.",
      "The pattern is clear to those who look.",
    ],
    "The Inquisitor": [
      "Now THAT'S leadership.",
      "Couldn't have put it better.",
      "Remind everyone to remember this.",
    ],
    "Dorian Pavus": [
      "Elegantly stated.",
      "A refined observation.",
      "Bravo, bravo indeed.",
    ],
    Vivienne: [
      "One must acknowledge brilliance when one sees it.",
      "A most civilized perspective.",
      "Excellence recognizes excellence.",
    ],
    "The Iron Bull": [
      "This is the truth right here.",
      "What they said.",
      "Couldn't agree more.",
    ],
    Blackwall: [
      "Truth worth remembering.",
      "This is the way forward.",
      "A warden could not say it better.",
    ],
    Cole: [
      "Real. True. Important.",
      "This speaks to people.",
      "The hurt understands this.",
    ],
    Leliana: [
      "Wisdom the Divine would approve of.",
      "My network speaks of this constantly.",
      "Even the birds carry this message.",
    ],
    Guest: ["Absolutely right.", "Couldn't agree more.", "This is the way."],
  };

  // Echoes with character-specific unique content
  for (const post of posts) {
    const echoPossibility = faker.number.int({ min: 0, max: 100 });
    if (echoPossibility > 40) {
      const potentialEchoers = faker.helpers.arrayElements(
        authors,
        faker.number.int({ min: 1, max: 2 })
      );
      for (const echoer of potentialEchoers) {
        if (echoer.id !== post.authorId) {
          const possibleReactions = echoReactionsByCharacter[echoer.name] || [
            "Agreed.",
            "Well said.",
          ];
          const reaction = faker.helpers.arrayElement(possibleReactions);

          await prisma.post.create({
            data: {
              authorId: echoer.id,
              content: reaction,
              echoParentId: post.id,
              publishedAt: new Date(),
            },
          });
        }
      }
    }
  }

  // Character-specific comments and likes
  for (const post of posts) {
    const commentCount = faker.number.int({ min: 0, max: 4 });
    const commenters = faker.helpers.arrayElements(
      authors,
      Math.min(commentCount, authors.length - 1)
    );

    for (const commenter of commenters) {
      if (commenter.id !== post.authorId) {
        const possibleComments = echoCommentsByCharacter[commenter.name] || [
          "Great post!",
          "I agree.",
          "Well said.",
        ];
        const comment = faker.helpers.arrayElement(possibleComments);

        await prisma.comment.create({
          data: {
            postId: post.id,
            authorId: commenter.id,
            content: comment,
          },
        });
      }
    }

    const likerCount = faker.number.int({ min: 1, max: 6 });
    const likers = faker.helpers.arrayElements(authors, likerCount);
    for (const liker of likers) {
      try {
        await prisma.like.create({
          data: { postId: post.id, userId: liker.id },
        });
      } catch (e) {
        // Ignore duplicate likes
      }
    }
  }

  // follow relationships
  for (const u of authors) {
    const others = authors.filter((x) => x.id !== u.id);
    const followSome = faker.helpers.arrayElements(
      others,
      faker.number.int({ min: 2, max: 5 })
    );
    for (const target of followSome) {
      await prisma.follow.upsert({
        where: {
          followerId_followingId: { followerId: u.id, followingId: target.id },
        },
        create: { followerId: u.id, followingId: target.id },
        update: {},
      });
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
