import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
  data = [
    {
      id: '13123123123',
      data: 'elo',
      img: 'https://images.unsplash.com/photo-1624787251683-ac2c57733cbc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
    },
    {
      id: '112123123212112',
      data: 'elo2',
      img: 'https://images.unsplash.com/photo-1545147976-46eba097895e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
    },
    {
      id: '112213w1232112',
      data: 'elo2',
    },
  ];

  ngOnInit(): void {}
}
