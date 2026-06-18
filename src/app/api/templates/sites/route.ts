import { NextResponse } from 'next/server'
export async function GET() {
  const csv = 'site_name,client_name,address,latitude,longitude,radius_meters\nHeadquarters,Acme Corp,123 Main St,-26.2041,28.0473,150\nWarehouse A,Acme Corp,456 Depot Rd,-26.1929,28.0305,200\n'
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="sites-template.csv"' } })
}
