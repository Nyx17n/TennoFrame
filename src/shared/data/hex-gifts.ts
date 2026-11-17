import { toWikiFileAssetUrl } from '../schemas/worldstate.schema'

export type HexMemberId = 'arthur' | 'eleanor' | 'lettie' | 'amir' | 'aoi' | 'quincy'

export interface HexGiftEntry {
  readonly id: string
  readonly nameFr: string
  readonly nameEn: string
  readonly imageAssetUrl: string
  readonly hollars: number
  readonly stock: number
  readonly chemistry: 20 | 10 | 5
}

export interface HexMemberGiftGuide {
  readonly id: HexMemberId
  readonly name: string
  readonly kimHandle: string
  readonly protoframe: string
  readonly accentHex: string
  readonly portraitAssetUrl: string
  readonly pixelGlyphAssetUrl: string
  readonly bioFr: string
  readonly bioEn: string
  readonly warningFr?: string
  readonly warningEn?: string
  readonly gifts: readonly HexGiftEntry[]
}

export const HOLLARS_ICON_URL = toWikiFileAssetUrl('Hollars.png')

export const HEX_GIFT_GUIDES: readonly HexMemberGiftGuide[] = [
  {
    id: 'arthur',
    name: 'Arthur',
    kimHandle: 'Broadsword',
    protoframe: 'Excalibur',
    accentHex: '#f59e0b',
    portraitAssetUrl: toWikiFileAssetUrl('Arthur_Dossier.jpg'),
    pixelGlyphAssetUrl: toWikiFileAssetUrl('ArthurPixelGlyph.png'),
    bioFr:
      'Arthur adore cuisiner : tous les cadeaux liés à la nourriture, à la cuisson ou aux équipements pratiques de cuisine sont d’excellentes options.',
    bioEn:
      'Arthur enjoys cooking, so any food or cooking equipment-related gifts are a good option.',
    gifts: [
      {
        id: 'arthur-toaster-oven',
        nameFr: 'Four Grille-Pain KineKitchen',
        nameEn: 'KineKitchen Toaster Oven',
        imageAssetUrl: toWikiFileAssetUrl('ToasterOven.png'),
        hollars: 35_000,
        stock: 1,
        chemistry: 20
      },
      {
        id: 'arthur-toaster',
        nameFr: 'Grille-Pain KineKitchen',
        nameEn: 'KineKitchen Toaster',
        imageAssetUrl: toWikiFileAssetUrl('Toaster.png'),
        hollars: 22_000,
        stock: 1,
        chemistry: 20
      },
      {
        id: 'arthur-microwave',
        nameFr: 'Micro-Ondes KineKitchen',
        nameEn: 'KineKitchen Microwave',
        imageAssetUrl: toWikiFileAssetUrl('Microwave.png'),
        hollars: 45_000,
        stock: 1,
        chemistry: 20
      },
      {
        id: 'arthur-tannoy',
        nameFr: 'Interphone Kinemantik Tannoy',
        nameEn: 'Kinemantik Tannoy (Announce)',
        imageAssetUrl: toWikiFileAssetUrl('Microphone.png'),
        hollars: 30_000,
        stock: 1,
        chemistry: 20
      },
      {
        id: 'arthur-propane',
        nameFr: 'Bouteille de Gaz Propane Green Gorilla',
        nameEn: 'Green Gorilla Propane Gas Tank',
        imageAssetUrl: toWikiFileAssetUrl('PropaneGas.png'),
        hollars: 10_000,
        stock: 2,
        chemistry: 10
      }
    ]
  },
  {
    id: 'eleanor',
    name: 'Eleanor',
    kimHandle: 'Salem',
    protoframe: 'Nyx',
    accentHex: '#a855f7',
    portraitAssetUrl: toWikiFileAssetUrl('Eleanor_Dossier.jpg'),
    pixelGlyphAssetUrl: toWikiFileAssetUrl('EleanorPixelGlyph.png'),
    bioFr:
      'En tant qu’ancienne journaliste, elle adore recevoir du papier, des carnets, des crayons, des stylos ou des plantes qui lui rappellent des jours meilleurs.',
    bioEn:
      "As a former journalist, it's a good idea to send her things like paper, pencils, pens, and anything that might be a pleasant reminder of better times.",
    gifts: [
      {
        id: 'eleanor-planter',
        nameFr: 'Jardinière Suspendue KineBasik',
        nameEn: 'KineBasik Hanging Planter',
        imageAssetUrl: toWikiFileAssetUrl('Planter.png'),
        hollars: 10_000,
        stock: 1,
        chemistry: 20
      },
      {
        id: 'eleanor-notepad',
        nameFr: 'Bloc-notes File-a-Style',
        nameEn: 'File-a-Style Notepad',
        imageAssetUrl: toWikiFileAssetUrl('Notepad.png'),
        hollars: 9_000,
        stock: 2,
        chemistry: 10
      },
      {
        id: 'eleanor-binder',
        nameFr: 'Classeur File-a-Style',
        nameEn: 'File-a-Style Binder',
        imageAssetUrl: toWikiFileAssetUrl('Binder.png'),
        hollars: 8_000,
        stock: 4,
        chemistry: 5
      },
      {
        id: 'eleanor-pencils',
        nameFr: 'Crayons File-a-Style',
        nameEn: 'File-a-Style Pencils',
        imageAssetUrl: toWikiFileAssetUrl('Pencil.png'),
        hollars: 5_000,
        stock: 4,
        chemistry: 5
      },
      {
        id: 'eleanor-pens',
        nameFr: 'Stylos File-a-Style',
        nameEn: 'File-a-Style Pens',
        imageAssetUrl: toWikiFileAssetUrl('Pen.png'),
        hollars: 6_000,
        stock: 4,
        chemistry: 5
      }
    ]
  },
  {
    id: 'lettie',
    name: 'Lettie',
    kimHandle: 'Belladonna ~{@',
    protoframe: 'Trinity',
    accentHex: '#ec4899',
    portraitAssetUrl: toWikiFileAssetUrl('Lettie_Dossier.jpg'),
    pixelGlyphAssetUrl: toWikiFileAssetUrl('LettiePixelGlyph.png'),
    bioFr:
      'Médecin acharnée au travail et grande amoureuse des animaux, Lettie apprécie tout ce qui l’aide à rester éveillée (café !) ou à sauver des vies.',
    bioEn:
      'As a hardworking medic, Lettie will appreciate anything that helps keep her awake or helps her save others. She is also a big fan of animals.',
    gifts: [
      {
        id: 'lettie-coffee-machine',
        nameFr: 'Machine à Café KineKitchen',
        nameEn: 'KineKitchen Coffee Machine',
        imageAssetUrl: toWikiFileAssetUrl('CoffeeMachine.png'),
        hollars: 45_000,
        stock: 1,
        chemistry: 20
      },
      {
        id: 'lettie-medkit',
        nameFr: 'Trousse Médicale KineBasik',
        nameEn: 'KineBasik Medical Kit',
        imageAssetUrl: toWikiFileAssetUrl('MedKit.png'),
        hollars: 60_000,
        stock: 2,
        chemistry: 10
      },
      {
        id: 'lettie-coffee-cups',
        nameFr: 'Gobelets à Café File-a-Style',
        nameEn: 'File-a-Style Coffee Cups',
        imageAssetUrl: toWikiFileAssetUrl('CoffeeCup.png'),
        hollars: 4_000,
        stock: 4,
        chemistry: 5
      },
      {
        id: 'lettie-coffee-mug',
        nameFr: 'Mug à Café KineBasik',
        nameEn: 'KineBasik Coffee Mug',
        imageAssetUrl: toWikiFileAssetUrl('Mug.png'),
        hollars: 2_000,
        stock: 4,
        chemistry: 5
      }
    ]
  },
  {
    id: 'amir',
    name: 'Amir',
    kimHandle: 'H16h V0l7463',
    protoframe: 'Volt',
    accentHex: '#38bdf8',
    portraitAssetUrl: toWikiFileAssetUrl('Amir_Dossier.jpg'),
    pixelGlyphAssetUrl: toWikiFileAssetUrl('AmirPixelGlyph.png'),
    bioFr:
      'Il est ultra curieux et passionné par tout ce qui touche à la technologie, à l’informatique ou aux jeux vidéo.',
    bioEn: 'He is very curious about all things tech or gaming-related.',
    gifts: [
      {
        id: 'amir-hockey',
        nameFr: 'Table de Air Hockey Kinemantik',
        nameEn: 'Kinemantik Hockey Table',
        imageAssetUrl: toWikiFileAssetUrl('AirHockey.png'),
        hollars: 85_000,
        stock: 1,
        chemistry: 20
      },
      {
        id: 'amir-headphones',
        nameFr: 'Casque Sans Fil KineMagik!',
        nameEn: 'KineMagik! Wireless Headphones',
        imageAssetUrl: toWikiFileAssetUrl('HeadPhones.png'),
        hollars: 10_000,
        stock: 1,
        chemistry: 20
      },
      {
        id: 'amir-monitor',
        nameFr: 'Écran de Jeu K.A.H.',
        nameEn: 'K.A.H Game Monitor',
        imageAssetUrl: toWikiFileAssetUrl('PackagedMonitor.png'),
        hollars: 12_500,
        stock: 2,
        chemistry: 10
      },
      {
        id: 'amir-console',
        nameFr: 'Console de Jeu K.A.H.',
        nameEn: 'K.A.H Game System',
        imageAssetUrl: toWikiFileAssetUrl('PackagedGameConsole.png'),
        hollars: 20_000,
        stock: 2,
        chemistry: 10
      },
      {
        id: 'amir-gpu',
        nameFr: 'Carte Graphique Kinemantik 256 GPU',
        nameEn: 'Kinemantik 256 GPU',
        imageAssetUrl: toWikiFileAssetUrl('HardwareGPU.png'),
        hollars: 70_000,
        stock: 2,
        chemistry: 10
      },
      {
        id: 'amir-tv',
        nameFr: 'Téléviseur Kinemantik 840 HD',
        nameEn: 'Kinemantik 840 HD TV',
        imageAssetUrl: toWikiFileAssetUrl('TelevisionA.png'),
        hollars: 8_500,
        stock: 2,
        chemistry: 10
      }
    ]
  },
  {
    id: 'aoi',
    name: 'Aoi',
    kimHandle: 'Glimmer',
    protoframe: 'Mag',
    accentHex: '#06b6d4',
    portraitAssetUrl: toWikiFileAssetUrl('Aoi_Dossier.jpg'),
    pixelGlyphAssetUrl: toWikiFileAssetUrl('AoiPixelGlyph.png'),
    bioFr:
      'Immense fan de musique : tout ce qui touche au groupe On-Lyne, à l’audio ou aux deux-roues est une valeur sûre.',
    bioEn:
      'She is a huge fan of music, so anything related to On-Lyne or music in general is a safe bet.',
    warningFr:
      'Piège à éviter : curieusement, l’enceinte seule « Kinemantik Speaker » (500W sans ampli) ne lui plaît pas ! Offre-lui plutôt le Casque Sans Fil, le CD On-Lyne, le Scooticle ou le Système Audio avec ampli.',
    warningEn:
      'Trap to avoid: oddly, the standalone "Kinemantik Speaker" is not good for her! Stick to Wireless Headphones, On-Lyne CD, The Scooticle, or the full Speaker System with Amp.',
    gifts: [
      {
        id: 'aoi-headphones',
        nameFr: 'Casque Sans Fil KineMagik!',
        nameEn: 'KineMagik! Wireless Headphones',
        imageAssetUrl: toWikiFileAssetUrl('HeadPhones.png'),
        hollars: 10_000,
        stock: 1,
        chemistry: 20
      },
      {
        id: 'aoi-onlyne',
        nameFr: 'Album CD « On-lyne: The Boys R Back »',
        nameEn: 'On-lyne: The Boys R Back',
        imageAssetUrl: toWikiFileAssetUrl('CompactDiscC.png'),
        hollars: 4_000,
        stock: 1,
        chemistry: 20
      },
      {
        id: 'aoi-scooticle',
        nameFr: 'Trottinette « Le Scooticle »',
        nameEn: 'The Scooticle',
        imageAssetUrl: toWikiFileAssetUrl('Scooter.png'),
        hollars: 100_000,
        stock: 1,
        chemistry: 20
      },
      {
        id: 'aoi-speaker-system',
        nameFr: 'Système Audio Kinemantik (avec Ampli)',
        nameEn: 'Kinemantik Speaker System',
        imageAssetUrl: toWikiFileAssetUrl('PackagedStereoAmp.png'),
        hollars: 22_000,
        stock: 1,
        chemistry: 20
      }
    ]
  },
  {
    id: 'quincy',
    name: 'Quincy',
    kimHandle: 'Soldja1Shot1kil',
    protoframe: 'Cyte-09',
    accentHex: '#22c55e',
    portraitAssetUrl: toWikiFileAssetUrl('Quincy_Dossier.jpg'),
    pixelGlyphAssetUrl: toWikiFileAssetUrl('QuincyPixelGlyph.png'),
    bioFr:
      'Il aime troquer et échanger des marchandises avec les autres, et c’est aussi un grand passionné de vidéo et de son stand de tir.',
    bioEn:
      'He likes to trade goods with others and also is a big fan of his shooting range.',
    gifts: [
      {
        id: 'quincy-camera',
        nameFr: 'Caméra Vidéo Numérique Kinemantik',
        nameEn: 'Kinemantik Digital Video Camera',
        imageAssetUrl: toWikiFileAssetUrl('PackagedVideoCamera.png'),
        hollars: 35_000,
        stock: 1,
        chemistry: 20
      },
      {
        id: 'quincy-av-receiver',
        nameFr: 'Ampli Audio/Vidéo Kinemantik A/V',
        nameEn: 'Kinemantik A/V Receiver',
        imageAssetUrl: toWikiFileAssetUrl('AVReceiver.png'),
        hollars: 15_000,
        stock: 2,
        chemistry: 10
      },
      {
        id: 'quincy-poster',
        nameFr: 'Poster Insta-Print File-A-Style',
        nameEn: 'File-A-Style Insta-Print Poster',
        imageAssetUrl: toWikiFileAssetUrl('EntratiPoster.png'),
        hollars: 2_500,
        stock: 4,
        chemistry: 5
      },
      {
        id: 'quincy-vhs',
        nameFr: 'VHS « Le Cercle des Camarades »',
        nameEn: 'Circle of Comrades VHS',
        imageAssetUrl: toWikiFileAssetUrl('VideoCasseteA.png'),
        hollars: 12_000,
        stock: 4,
        chemistry: 5
      },
      {
        id: 'quincy-cellphone',
        nameFr: 'Téléphone Portable Kinemantik',
        nameEn: 'Kinemantik Cellphone',
        imageAssetUrl: toWikiFileAssetUrl('CellPhone.png'),
        hollars: 14_000,
        stock: 4,
        chemistry: 5
      }
    ]
  }
]
