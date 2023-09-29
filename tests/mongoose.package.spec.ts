
import {describe, test} from '@jest/globals';
import { model, Schema } from "mongoose";
import chai from 'chai';

const { expect } = chai;

describe('mongoose package', () => {
  test(`discriminators (https://github.com/Automattic/mongoose/issues/13906)`, async () => {
    const options = { discriminatorKey: 'type' };

    interface IEvent  {
      type: string;
    }

    const eventSchema = new Schema({date: Schema.Types.Date}, options);
    const Event = model<IEvent>('Event', eventSchema, );

    interface IClickedLinkEvent extends IEvent {
      url: string;
    }

    const clickedLinkEventSchema = new Schema({ url: String }, options);
    const ClickedLinkEvent = Event.discriminator<IClickedLinkEvent>('ClickedLinkEvent', clickedLinkEventSchema, 'clickedLinkEvent');

    interface IClickedImageEvent extends IEvent {
      image: string;
    }

    const clickedImageEventSchema = new Schema({ image: String}, options);
    const ClickedImageEvent = Event.discriminator<IClickedImageEvent>('ClickedImageEvent', clickedImageEventSchema, 'clickedImageEvent');


    const clickedLinkEvent = new ClickedLinkEvent({ url: 'https://clicked-link.com' });
    expect(clickedLinkEvent.type).to.equal('clickedLinkEvent');
    expect(clickedLinkEvent.url).to.equal('https://clicked-link.com');

    const clickedImageEvent = new ClickedImageEvent({ image: 'clicked-image.png'});
    expect(clickedImageEvent.type).to.equal('clickedImageEvent');
    expect(clickedImageEvent.image).to.equal('clicked-image.png');

    const query = {
      type: 'clickedLinkEvent',
      $or: [
        { type: 'clickedImageEvent' }
      ]
    };

    const result = await Event.find(query).exec();
    expect(result.length).to.equal(0);
  }, 10000);
})
