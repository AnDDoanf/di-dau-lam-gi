import React from "react";
import { PLACES } from "@/data/places";
import PlaceDetailClient from "./PlaceDetailClient";

interface PlacePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PLACES.map((place) => ({
    slug: place.slug,
  }));
}

export default async function PlacePage({ params }: PlacePageProps) {
  return <PlaceDetailClient params={params} />;
}
