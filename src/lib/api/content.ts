import pb, { COLLECTIONS } from "@/lib/pb";
import { 
  CMSContent, 
  RaceClassHierarchy, 
  ValueItem, 
  PrizeCategory, 
  RegistrationStep, 
  StarGuest, 
  Partner, 
  TimelineEvent,
  SingleContentRecord
} from "../types/content";

export async function getCMSContent(): Promise<CMSContent> {
  const records = await pb.collection("single_content").getFullList<SingleContentRecord>();
  const content: CMSContent = {};
  
  records.forEach(r => {
    if (r.is_image && r.image) {
      content[r.key] = pb.files.getURL(r, r.image);
    } else {
      content[r.key] = r.content || "";
    }
  });
  
  return content;
}

export async function getRaceHierarchy(): Promise<RaceClassHierarchy[]> {
  const classes = await pb.collection("race_class").getFullList({
    sort: "created",
  });
  
  const categories = await pb.collection("race_category").getFullList({
    expand: "race_class",
  });
  
  const pits = await pb.collection("race_pit").getFullList({
    expand: "race_category",
  });

  return classes.map(cls => ({
    id: cls.id,
    name: cls.name,
    description: cls.description,
    cover: cls.cover ? pb.files.getURL(cls, cls.cover) : "",
    categories: categories
      .filter(cat => cat.race_class === cls.id)
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        pits: pits
          .filter(pit => pit.race_category === cat.id)
          .map(pit => ({
            id: pit.id,
            name: pit.name,
            price: pit.price
          }))
      }))
  }));
}

export async function getValues(): Promise<ValueItem[]> {
  const records = await pb.collection("values").getFullList<any>({
    sort: "created",
  });
  return records.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    icon: r.icon
  }));
}

export async function getPrizeStructure(): Promise<PrizeCategory[]> {
  const categories = await pb.collection("prize_category").getFullList<any>();
  const winners = await pb.collection("prize_winner").getFullList<any>({
    sort: "position",
  });

  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    image: cat.image ? pb.files.getURL(cat, cat.image) : "",
    description: cat.description,
    winners: winners
      .filter(w => w.prize_category === cat.id)
      .map(w => ({
        id: w.id,
        position: w.position,
        title: w.title,
        prize: w.prize,
        description: w.description
      }))
  }));
}

export async function getRegistrationSteps(): Promise<RegistrationStep[]> {
  const records = await pb.collection("registration_step").getFullList<any>({
    sort: "position",
  });
  return records.map(r => ({
    id: r.id,
    position: r.position,
    title: r.title,
    description: r.description
  }));
}

export async function getStarGuests(): Promise<StarGuest[]> {
  const records = await pb.collection("star_guest").getFullList<any>();
  // Filter out MCs as requested
  return records
    .filter(r => r.subtitle !== "Official MC")
    .map(r => ({
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      description: r.description,
      cover: r.cover ? pb.files.getURL(r, r.cover) : ""
    }));
}

export async function getPartners(): Promise<Partner[]> {
  const records = await pb.collection("partner").getFullList<any>();
  return records.map(r => ({
    id: r.id,
    name: r.name,
    logo: r.logo ? pb.files.getURL(r, r.logo) : ""
  }));
}

export async function getTimeline(): Promise<TimelineEvent[]> {
  const records = await pb.collection("timeline").getFullList<any>({
    sort: "date",
  });
  return records.map(r => ({
    id: r.id,
    date: r.date,
    title: r.title,
    description: r.description
  }));
}
