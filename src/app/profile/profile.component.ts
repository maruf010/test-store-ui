import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile = {
    name: 'Esrat Jahan',
    title: 'Architect',
    image: 'assets/images/profile pic.webp',
    coverImage: 'assets/images/cover.webp',
    experience: '1 year',
    portfolioLink: 'www.behance.net/esratjahan',
    about: `Eligible to design & sign architectural drawigns/documents of max. 5 storey high residential buildings having max. total floor area of 1,000sqm./10,764 sft`,
    website: 'https://www.XXXX-XXXX',
    email: 'esratjahan@email.com',
    phone: '+880 XXXXXXXXXX',
    projects: [
      {
        title: 'Bungalow in Jhenaidah',
        image: 'assets/images/banner1.png',
        description: 'Designed this "Bungalow" in Jhenaidah'
      }
    ],
    locations: ['Dhaka', 'Jhenaidah','Shylet'],
    languages: ['Bangla', 'English'],
    socialLinks: {
      linkedin: '#',
      behance: '#',
      facebook: '#',
      youtube: '#',
      instagram: '#',
      tiktok: '#'
    }
  };

  constructor() { }

  ngOnInit(): void {
  }

  sendMessage() {
    // Implement message functionality
    console.log('Message clicked');
  }
}
